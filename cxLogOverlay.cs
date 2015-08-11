using Advanced_Combat_Tracker;
using System;
using RainbowMage.OverlayPlugin;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.IO;
using System.Text.RegularExpressions;

namespace cxLog
{
    public class cxLogOverlay : OverlayBase<cxLogOverlayConfig>
    {
        private Logger log;
        protected static FormActMain act = ActGlobals.oFormActMain;

        public cxLogOverlay(cxLogOverlayConfig config):base(config, config.Name)
        {
        }

        private class Logger
        {
            enum ENTITY_TYPE
            {
                ALLY, ENEMY
            }

            private class Entity
            {
                public ENTITY_TYPE Type
                {
                    get;
                }
                public double DPS
                {
                    get; set;
                }

                public String ID
                {
                    get;
                }

                public String Name
                {
                    get;
                }

                public List<ActionDetail> ActionBuffer
                {
                    get;
                }
                
                public bool isChar
                {
                    get;
                }     

                public Entity(String id, String name)
                {
                    this.ID = id;
                    this.Name = name;
                    this.ActionBuffer = new List<ActionDetail>();
                    this.DPS = 0;
                    this.isChar = false;
                    if(act.ActiveZone.ActiveEncounter.GetCombatant(this.Name) == null)
                    {
                        this.isChar = true;
                    }
                    this.Type = (this.isChar || act.ActiveZone.ActiveEncounter.GetAllies().Exists(a => a.Name == this.Name)) ? ENTITY_TYPE.ALLY : ENTITY_TYPE.ENEMY;
                }
            }

            protected struct ActionDetail
            {
                public String log;
                public String target;
                public String time;
                public String name;
                public int damage;
            }

            private List<Entity> entities = new List<Entity>();
            private  List<String> unsorted = new List<String>();
            private  cxLogOverlay overlay;
            private static Regex LOG_REGEX = new Regex(@"\[((?:\d{2,3}(?::|\.)??){4})]\s{1}(15|1A)");
            LogLineEntry last = null;

            public Logger(cxLogOverlay overlay)
            {
                this.overlay = overlay;
            }

            public void log()
            {
                int start = 0;

                start = (last == null) ? 0 : act.ActiveZone.ActiveEncounter.LogLines.LastIndexOf(last) + 1;
                if (act.ActiveZone != null && act.ActiveZone.ActiveEncounter != null)
                {
                    EncounterData enc = act.ActiveZone.ActiveEncounter;
                    if (enc.LogLines != null)
                    {
                        List<LogLineEntry> log = act.ActiveZone.ActiveEncounter.LogLines.GetRange(start, act.ActiveZone.ActiveEncounter.LogLines.Count - start);
                        if(log.Count > 0)
                            last = log[log.Count - 1];
                        foreach (LogLineEntry line in log)
                        {
                            this.unsorted.Add(line.LogLine);
                        }
                    }
                }
                return;
                
                }

            private void parseUnsorted()
            {
                foreach (String line in this.unsorted)
                {
                    if (LOG_REGEX.IsMatch(line))
                    {

                        Match m = LOG_REGEX.Match(line);
                        String tmp = line.Substring(18);
                        String[] data = tmp.Split(':');
                        ActionDetail detail = new ActionDetail();
                        String source = null;
                        string name = null;
                        String tname = null;
                        detail.time = m.Groups[1].Value;
                        detail.log = m.Groups[2].Value;
                        if (m.Groups[2].Value == "15")
                        {
                            name = data[1];
                            tname = data[5];
                            source = data[0];
                            detail.target = data[4];
                            detail.name = data[3];
                            detail.damage = int.Parse(data[15], System.Globalization.NumberStyles.HexNumber);
                        }
                        else if (m.Groups[2].Value == "1A")
                        {
                            name = data[4];
                            tname = data[6];
                            source = data[3];
                            detail.target = data[5];
                            detail.name = data[1];
                            detail.damage = 0;
                        }

                        if (!this.entities.Exists(e => e.ID == source)) {
                            Entity etmp = new Entity(source, name);
                            this.entities.Add(etmp);
                        }
                        if (!this.entities.Exists(e => e.ID == detail.target))
                        {                          
                            Entity etmp = new Entity(detail.target, tname);
                            this.entities.Add(etmp);
                        }
                        this.entities.Find(e => e.ID == source).ActionBuffer.Add(detail);


                    }
                }
                this.entities.ForEach(e =>
                {
                    CombatantData ctmp = (e.isChar) ? act.ActiveZone.ActiveEncounter.GetCombatant(ActGlobals.charName) : act.ActiveZone.ActiveEncounter.GetCombatant(e.Name);
                    if (ctmp != null)
                        e.DPS = ctmp.EncDPS;
                });
                this.unsorted.Clear();
            }

            public String pop()
            {
                this.log();
                this.parseUnsorted();
                String tmp = this.logJSON();
                this.entities = new List<Entity>();
                return tmp;
            }

            private String logJSON()
            {
                return JsonConvert.SerializeObject(this.entities);
            }
        }

        protected override void Update()
        {
            try {
                if (actReady())
                {
                    if (this.log == null && this.Overlay.Renderer.Browser.GetMainFrame() != null)
                    {
                        this.log = new Logger(this);
                    }

                   this.push(this.log.pop());
                }
            } catch (Exception e)
            {
                this.push(e.ToString());
            }
        }

        protected void push(String message)
        {
            try
            {
                this.Overlay.Renderer.Browser.GetMainFrame().ExecuteJavaScript(CreateEventDispatcherScript(message), null, 0);
            } catch(Exception e)
            {
                return;
            }
            
        }

        private void dblog(dynamic message)
        {
            FileStream fs = new FileStream(@"c:\debug.txt", FileMode.Append);
            StreamWriter f = new StreamWriter(fs);
            f.WriteLine(message);
            f.Close();
        }

        private string CreateEventDispatcherScript(string message = "no data")
        {
            return "var cxLog = '"+ CreateJsonSafeString(message) + "';\n" +  "document.dispatchEvent(new CustomEvent('onOverlayDataUpdate', { detail: cxLog }));";
        }

        private static bool actReady()
        {
            if (ActGlobals.oFormActMain != null && ActGlobals.oFormActMain.ActiveZone != null)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        public static string CreateJsonSafeString(string str)
        {
            return str
                .Replace("\"", "\\\"")
                .Replace("'", "\\'")
                .Replace("\r", "\\r")
                .Replace("\n", "\\n")
                .Replace("\t", "\\t");
        }
    }
}