/*
 * Dawson Reid
 */

var socket = io.connect('http://localhost');

$(document).ready(function () {

  // console click event
  $('#noct-console').click(function() {
    $('#noct-stdin'),focus();
  });
});

window.onkeyup = function(e) {

  if (e.keyCode === 13)
  {
      var
        cmd = $('#noct-stdin').val(),
        channel = 0;

      $('#noct-sdtin').val('');

      socket.emit('octave', {channel: channel, cmd: cmd + '\n'});
      $('#noct-stdout').append('<font class=\'noct-cfont\'>&gt; ' + cmd + '</font><br />');
      $('#noct-screen').scrollTop($('#noct-stdout').height());
  }
};

socket.on('octave', function(octOut) {
  $('#noct-stdout').append('<font class=\'noct-cfont\'>' + octOut.msg + '</font><br />');
});

