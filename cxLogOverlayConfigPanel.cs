using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace cxLog
{
    public partial class cxLogOverlayConfigPanel : UserControl
    {
        private cxLogOverlayConfig config;
        private cxLogOverlay overlay;

        public cxLogOverlayConfigPanel(cxLogOverlay overlay)
        {
            InitializeComponent();
            this.overlay = overlay;
            this.config = overlay.Config;

            SetupControlProperties();
            SetupConfigEventHandlers();
        }

        private void SetupConfigEventHandlers()
        {
            this.config.VisibleChanged += (o, e) =>
            {
                this.InvokeIfRequired(() =>
                {
                    this.cbShow.Checked = e.IsVisible;
                });
            };

            this.config.UrlChanged += (o, e) =>
            {
                this.InvokeIfRequired(() =>
                {
                    this.tbFile.Text = e.NewUrl;
                });
            };
        }

        private void SetupControlProperties()
        {
            this.cbShow.Checked = config.IsVisible;
            this.tbFile.Text = config.Url;
        }

        private void InvokeIfRequired(Action action)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(action);
            }
            else
            {
                action();
            }
        }
        private void cbShow_CheckedChanged(object sender, EventArgs e)
        {
            this.config.IsVisible = cbShow.Checked;
        }

        private void tableLayoutPanel1_Paint(object sender, PaintEventArgs e)
        {

        }

        private void btnFile_Click(object sender, EventArgs e)
        {
            OpenFileDialog ofd = new OpenFileDialog();
            if(ofd.ShowDialog() == DialogResult.OK)
            {
                this.config.Url = new Uri(ofd.FileName).ToString();
            }
        }

        private void tbFile_Leave(object sender, EventArgs e)
        {
            this.config.Url = tbFile.Text;
        }
    }
}
