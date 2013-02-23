$ = jQuery;
$(document).ready(function() {
  var socket = io.connect('http://localhost');
  
  socket.on('connected', function (data) {
    console.log('connected');

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
    $('.mc.active').attr({ scrollTop: $('.mc.active').attr("scrollHeight") });

    socket.emit('octave-received', { status: 'ok' });
  });

  var starting_fresh = true;
  if (starting_fresh) {
    var mc = new EJS({url: '/tpl/mc.ejs'}).render({channel : 1, scrollback: ''});
    console.log(mc);
    $('#mc').html(mc);
    $('#mc-1').addClass('active');
    socket.emit('octave', { channel: 1, cmd: ''});
  }
  else {
    // @TODO Retrieve channel content, loop through channels
    //var mc = new EJS({url: '/tpl/mc.ejs'}).render({channel : 1, scrollback: ''});
    //console.log(mc);
    //$('#mc').append(mc);
  }


  function attachFormSubmit(context) {
    $('form.input', context).submit(function() {
      var cmd = $(".input-text", this).val();
      $('.scrollback', $(this).parent()).append('<div class="row input">> ' + cmd + '</div>');
      $('.input-text', this).val('');
      var index = activeMCh();
      socket.emit('octave', { channel: index, cmd: cmd + '\n'});
      return false;
    });
  }
  attachFormSubmit(document);

  function attachChSwitchClick(context) {
    $('.ch-link', context).click(function() {
      var index = $("a.ch-link").index(this);
      $('.mc.active').removeClass('active');
      $('#channels .active').removeClass('active');
      $(this).addClass('active');
      $('.mc:eq(' + index + ')').addClass('active');
    });
  }
  attachChSwitchClick(document);

  $('#new-channel').click(function() {
    var current_channels = $('#channels ul li').length;
    var next_ch = current_channels + 1;
    $('#channels .active').removeClass('active');
    $('#channels ul').append('<li><a href="#" class="ch-link active">Ch ' + next_ch + '</a></li>');
    attachChSwitchClick($('#channels ul li:last'));

    var mc = new EJS({url: '/tpl/mc.ejs'}).render({channel : next_ch, scrollback: ''});

    $('.mc.active').removeClass('active');
    
    $('#mc').append(mc);
    attachFormSubmit($('#mc-' + next_ch));
    $('#mc-' + next_ch).addClass('active');
  });

  function activeMCh() {
    return $('.mc').index($('.mc.active')) + 1;
  }

  $('#reset-channel').click(function() {
    socket.emit('reset', { channel: activeMCh() });
  });
  // $('a#save-channel').click(function() {
  //   socket.emit('save', { channel: activeMCh() });
  // });


});