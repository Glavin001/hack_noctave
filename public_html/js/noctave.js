$(document).ready(function() {
  var socket = io.connect('http://localhost');
  
  socket.on('connected', function (data) {
    console.log('connected');
  });

  socket.on('octave', function (data) {
    console.log(data);
    socket.emit('octave-received', { status: 'ok' });
  });


});
