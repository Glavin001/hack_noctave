$ = jQuery;
$(document).ready(function() {
  var socket = io.connect('http://localhost');
  
  socket.on('connected', function (data) {
    console.log('connected');

    var starting_fresh = true;
    if (starting_fresh) {
      var mc = new EJS({url: '/tpl/mc.ejs'}).render({channel : 1, scrollback: ''});
      console.log(mc);
      $('#mc').html(mc);
      $('#mc-1').show();
      socket.emit('octave', { channel: 1, cmd: ''});
    }
    else {
      // @TODO Retrieve channel content, loop through channels
      //var mc = new EJS({url: '/tpl/mc.ejs'}).render({channel : 1, scrollback: ''});
      //console.log(mc);
      //$('#mc').append(mc);
    }
  });

  socket.on('octave', function (data) {
    console.log(data);
    
    var toAppend = '';
    //for (var i = 0; i < data.lines.length; i++) {
    //  toAppend = toAppend + '<div class="row output">' + data.lines[i] + '</div>';
    //}
    // toAppend = <div class="row output">' + data.msg + '</div>';
    console.log('To append:');
    console.log(toAppend);
    $('#mc-' + data.channel + ' .scrollback').append('<div class="output-lines">' + data.msg + '</div>');

    socket.emit('octave-received', { status: 'ok' });
  });



  $('form.input').submit(function() {
    console.log('hi');
    var cmd = $(".input-text", this).val();
    $('.scrollback', $(this).parent()).append('<div class="row input">> ' + cmd + '</div>');
    $('.input-text', this).val('');
    socket.emit('octave', { channel: 1, cmd: cmd + '\n'});
    return false;
  });

});