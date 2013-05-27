/**
 * @name        jQuery Countdown Plugin
 * @author      Martin Angelov
 * @version     1.0
 * @url         http://tutorialzine.com/2011/12/countdown-jquery/
 * @license     MIT License
 */

(function($){
    
    // Creating the plugin
    $.fn.countdown = function(){        
        return this;
    };

    $.fn.setScore = function(score){
        updateDuo(score);
    };

    // This function updates two digit positions at once
    function updateDuo(value){
        switchDigit($("#dozen"),Math.floor(value/10)%10);
        switchDigit($("#units"),value%10);
    }

    // Creates an animated transition between the two numbers
    function switchDigit(position,number){

        var digit = position.find('.digit')

        if(digit.is(':animated')){
            return false;
        }

        if(position.text() == number){
            // We are already showing this number
            return false;
        }

        var replacement = $('<span>',{
            'class':'digit',
            css:{
                top:'-2.1em',
                opacity:0
            },
            html:number
        });

        // The .static class is added when the animation
        // completes. This makes it run smoother.

        digit
            .before(replacement)
            .removeClass('static')
            .animate({top:'2.5em',opacity:0},'fast',function(){
                digit.remove();
            })

        replacement
            .delay(100)
            .animate({top:0,opacity:1},'fast',function(){
                replacement.addClass('static');
            });
    }

})(jQuery);