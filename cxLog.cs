using RainbowMage.OverlayPlugin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace cxLog
{
    public class cxLog : IOverlayAddon
    {
        public string Name
        {
            get { return "cxLog"; }
        }

        public string Description
        {
            get { return "Addon for graphs and combat logging"; }
        }

        public Type OverlayType
        {
            get { return typeof(cxLogOverlay); }
        }

        public Type OverlayConfigType
        {
            get { return typeof(cxLogOverlayConfig); }
        }

        public Type OverlayConfigControlType
        {
            get { return typeof(cxLogOverlayConfigPanel); }
        }

        public IOverlay CreateOverlayInstance(IOverlayConfig config)
        {
            return new cxLogOverlay((cxLogOverlayConfig)config);
        }

        public IOverlayConfig CreateOverlayConfigInstance(string name)
        {
            return new cxLogOverlayConfig(name);
        }

        public System.Windows.Forms.Control CreateOverlayConfigControlInstance(IOverlay overlay)
        {
            return new cxLogOverlayConfigPanel((cxLogOverlay) overlay);
        }

        public void Dispose()
        {
            
        }
    }
}
