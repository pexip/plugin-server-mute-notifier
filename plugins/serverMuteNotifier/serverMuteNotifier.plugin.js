(function () {
  var uuid = '';
  var serverMute = false;

  function load(participants$, conferenceDetails$) {
    console.log('load server-mute-notifier-plugin', window.location.hostname);
    let styleSheet = document.createElement('link');
    styleSheet.rel = 'stylesheet';
    styleSheet.href =
      'custom_configuration/plugins/serverMuteNotifier/assets/css/styles.css';
    document.head.appendChild(styleSheet);

    const actionsSubscription = PEX.actions$.subscribe({
      next(action) {
        if (action && action.type) {
          if (action.type == '[Conference] Set Self UUID') {
            uuid = action.payload;
          } else if (action.type == '[Participant] Muted Changed') {
            if (action.payload.uuid == uuid) {
              serverMute = action.payload.muted;
              updateMute();
            }
          } else if (action.type == '[Conference] Disconnect Success') {
            serverMute = false;
            updateMute();
          }
        }
      },
      error(err) {
        console.log('Error Action: ', err);
      },
    });
  }

  function updateMute() {
    var micOnButtonContainer = document.getElementById(
      'toolbar-audio-on__button-container'
    );
    var micOffButtonContainer = document.getElementById(
      'toolbar-audio-off__button-container'
    );

    let micOnButton = micOnButtonContainer
      ? micOnButtonContainer.getElementsByTagName('button')[0]
      : undefined;
    let micOffButton = micOffButtonContainer
      ? micOffButtonContainer.getElementsByTagName('button')[0]
      : undefined;

    updateMuteStyle(micOnButtonContainer, micOnButton);
    updateMuteStyle(micOffButtonContainer, micOffButton);

    notifyMute();
  }

  function updateMuteStyle(container, elem) {
    if (elem) {
      if (serverMute) {
        elem.style.display = 'none';

        let micDisabled = document.createElement('button');
        micDisabled.id = 'mic-disabled';
        micDisabled.classList.add('mic-disabled');
        micDisabled.ariaLabel = 'Mic muted by host';

        let micDisabledSVG = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg'
        );
        micDisabledSVG.classList.add('pex-stage__toolbar-button-icon');
        micDisabledSVG.classList.add('toolbar-buttons');
        micDisabledSVG.style.color = '#666';

        let micDisabledUse = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'use'
        );
        micDisabledUse.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          'icons.svg#mic-off'
        );

        micDisabledSVG.appendChild(micDisabledUse);
        micDisabled.appendChild(micDisabledSVG);
        container.appendChild(micDisabled);
      } else {
        elem.style.display = 'inline-block';

        let micDisabledButtons =
          document.getElementsByClassName('mic-disabled');
        while (micDisabledButtons.length > 0) micDisabledButtons[0].remove();
      }
    }
  }

  function notifyMute() {
    let toast = document.getElementById('toast');

    if (serverMute) {
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `You have been muted by the host`;
        document.body.appendChild(toast);
      }
    } else {
      if (toast) {
        toast.remove();
      }
    }
  }

  function unload() {
    console.log('unload server-mute-notifier-plugin');
  }

  PEX.pluginAPI.registerPlugin({
    id: 'server-mute-notifier-plugin-1.0',
    load: load,
    unload: unload,
  });
})();
