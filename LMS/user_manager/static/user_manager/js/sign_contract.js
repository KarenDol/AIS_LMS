$(document).ready(function() {
    $('.digit-group').find('input').each(function() {
        $(this).attr('maxlength', 1);
        $(this).on('input', function(e) {
            var enteredValue = e.target.value;
            if (!/^\d*$/.test(enteredValue)) {
                e.target.value = enteredValue.replace(/[^\d]/g, '');
            }

            var parent = $($(this).parent());
            var next = parent.find('input#' + $(this).data('next'));

            if (enteredValue.length > 0 && /^\d*$/.test(enteredValue) && next.length) {
                next.select();
            }
        });

        $(this).on('keydown', function(e) {
            var parent = $($(this).parent());
            var previous = parent.find('input#' + $(this).data('previous'));

            if ((e.keyCode === 8 || e.keyCode === 37) && $(this).val().length === 0 && previous.length) {
                previous.select();
            }
        });
    });
});
