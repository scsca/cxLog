using RainbowMage.OverlayPlugin;
using System;

namespace cxLog
{
    public class cxLogOverlayConfig : OverlayConfigBase
    {
       public cxLogOverlayConfig(string name) : base(name)
        {

        }

        private cxLogOverlayConfig() : base(null)
        {

        }

        public override Type OverlayType
        {
            get { return typeof(cxLogOverlay); }
        }
    }
}