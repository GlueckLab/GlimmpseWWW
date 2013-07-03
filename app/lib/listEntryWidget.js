
/*
* Define a list entry box
 */
(function( $, undefined ) {

$.widget( "glimmpse.listEntry", {
    version: "1.0.0",
    options: {

        // callbacks
        click: null,
        change: null
    },

    _create: function()
    {
        // Called first time widgetname() is
        // called on an element.
        // Put one time setup code here that
        // are not affected by config options.
        // Adding a class to the element is a
        // common practice to show that this
        // widget has been attached to it.
        this.element
            .addClass('glimmpse-listEntry')
            .css(
            {
                width: '400px',
                border: '2px solid black'
            });
        this.element
            .append("<input type='text' /><button>Add</button><div class='items'></div>") ;

        this.element.children(":button").click(function() {
            $(".items").append('<div>test</div>');
        });

        /*$(AddButton).click(function (e)  //on add input button click
        {
            if(x <= MaxInputs) //max input box allowed
            {
                FieldCount++; //text box added increment
                //add input box
                $(InputsWrapper).append('<div><input type="text" name="mytext[]" id="field_'+ FieldCount +'" value="Text '+ FieldCount +'"/><a href="#" class="removeclass">&times;</a></div>');
                x++; //text box increment
            }
            return false;
        });   */

    },

    _init: function()
    {
        // Called everytime widgetname() is
        // called on an element.  Called after _create
        // on initial call on an element
        // Put reinitialization code here since
        // config options may have been changed

    },

    _setOption: function(option, value)
    {
        // Called when widgetname('option' (or 'options'), 'name', value)
        // is called.  Use switch block to handle each option you've defined
        // in the options object.

        // Chain to super class (changes in 1.9)
        $.Widget.prototype._setOption.apply( this, arguments );

        this._init();
    },

    destroy: function()
    {
        // Clean up references you have stored so
        // garbage collection can happen.  Events are the
        // biggest issue.  However, good practice is to
        // return the element back to its original state
        // before this widget enhanced it.

        this.element
            .removeClass('glimmpse-listEntry')
            .css(
            {
                width: '',
                border: ''
            });

        // Chain to super class (changes in 1.9)
        $.Widget.prototype.destroy.call( this );
    }


});

})( jQuery );

