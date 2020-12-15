/*!
 * 2Click-Iframe-Privacy v0.3.0
 * https://github.com/01-Scripts/2Click-Iframe-Privacy
 *
 * Licensed MIT © 2018-2019 Michael Lorer - https://www.01-scripts.de/
 */

var _2ClickIframePrivacy = new function() {

    var config = {
        enableCookies: true,
        useSessionCookie: true,
        cookieNamespace: '_2ClickIPEnable-',
        showContentLabel: 'Show content.',
        showContentDescription: 'Click on the link to show the content.</br>',
        rememberChoiceLabel: 'Remember choice',
        privacyPolicyLabel: 'Data policy',
        privacyPolicyUrl: false,
        backgroundImageSrc: false
    };

    this.types = [
        {
            type: 'video'
        },
        {
            type: 'map'
        },
        {
            type: 'calendar'
        }];

    function setCookie(name, value, days) {
        var d = new Date;
        d.setTime(d.getTime() + 24*60*60*1000*days);
        document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
    }

    function setSessionCookie(name, value) {
        document.cookie = name + "=" + value + ";path=/";
    }

    function getCookie(name) {
        var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    }

    // Create <div>-element within the respective iframe to display the defined data-security message and get consent for loading the iframe content.
    function wrap(el, wrapper, type, text, background) {
        el.parentNode.insertBefore(wrapper, el);
        wrapper.className = 'privacy-msg privacy-'+type+'-msg';
        if(background !== false){
            wrapper.style.backgroundImage = 'url(\"'+ config.backgroundImageSrc + '\")';
            wrapper.style.backgroundPosition = 'center center';
            wrapper.style.backgroundColor = 'white';
            wrapper.style.backgroundRepeat = 'no-repeat';
            wrapper.style.backgroundSize = 'cover';
        }
        wrapper.style.width = el.clientWidth;
        wrapper.style.height = el.clientHeight;
        wrapper.innerHTML = text +'<a href="#foo" onclick="_2ClickIframePrivacy.EnableContent(\''+ type +'\'); return false;">'+config.showContentLabel+'</a>';
        if(config.enableCookies){
            wrapper.innerHTML = wrapper.innerHTML + '<br /><input type="checkbox" name="remind-\''+ type +'\'" /> <label>'+config.rememberChoiceLabel+'</label>';
        }
        if(config.privacyPolicyUrl){
            wrapper.innerHTML = wrapper.innerHTML + '<br /><a href="'+config.privacyPolicyUrl+'" target="_blank" rel="noopener">'+config.privacyPolicyLabel+'</a>';
        }
        wrapper.innerHTML = '<p>' + wrapper.innerHTML + '</p>';
        wrapper.appendChild(el);
    }

    this.EnableContent = function (type){
        var i;

        // Cookies globally enabled by config?
        if(config.enableCookies){
            var remind = false;
            var x = document.querySelectorAll('div.privacy-'+type+'-msg p input');
            // Check if any checkbox for the selected class was checked. If so a cookie will be set
            for (i = 0; i < x.length; i++) {
                if(x[i].checked == true){
                    remind = true;
                }
            }

            if(remind){
                if(config.useSessionCookie){
                    setSessionCookie(config.cookieNamespace+type, '1');
                }
                else{
                    setCookie(config.cookieNamespace+type, '1', 30);
                }
            }
        }

        var x = document.querySelectorAll('div.privacy-'+type+'-msg p');
        for (i = 0; i < x.length; i++) {
            x[i].parentNode.removeChild(x[i]);
        }

        x = document.querySelectorAll('div.privacy-'+type+'-msg');
        for (i = 0; i < x.length; i++) {
            var parent = x[i].parentNode;

            // Move all children out of the element
            while (x[i].firstChild) parent.insertBefore(x[i].firstChild, x[i]);

            // Remove the empty element
            parent.removeChild(x[i]);
        }

        x = document.querySelectorAll('iframe[data-2click-type="'+type+'"]');
        for (i = 0; i < x.length; i++) {
            x[i].src = x[i].getAttribute("data-src");
        }

        // If available, execute the callback that is defined for the currently active type
        for (i = 0; i < this.types.length; i++) {
            if(this.types[i].type == type && this.types[i].callback) {
                window[this.types[i].callback]();
            }
        }
    }

    this.init = function (Userconfig) {
        // Read UserConfiguration:
        if (typeof Userconfig.enableCookies !== 'undefined') {
            config.enableCookies = Userconfig.enableCookies;
        }
        if (typeof Userconfig.useSessionCookie !== 'undefined') {
            config.useSessionCookie = Userconfig.useSessionCookie;
        }
        if (typeof Userconfig.cookieNamespace !== 'undefined') {
            config.cookieNamespace = Userconfig.cookieNamespace;
        }
        if (typeof Userconfig.privacyPolicyUrl !== 'undefined') {
            config.privacyPolicyUrl = Userconfig.privacyPolicyUrl;
        }
        if (typeof Userconfig.showContentLabel !== 'undefined') {
            config.showContentLabel = Userconfig.showContentLabel;
        }
        //added user-defined show content description
        if (typeof Userconfig.showContentDescription !== 'undefined') {
            config.showContentDescription = Userconfig.showContentDescription;
        }
        if (typeof Userconfig.rememberChoiceLabel !== 'undefined') {
            config.rememberChoiceLabel = Userconfig.rememberChoiceLabel;
        }
        if (typeof Userconfig.privacyPolicyLabel !== 'undefined') {
            config.privacyPolicyLabel = Userconfig.privacyPolicyLabel;
        }
        //added user-defined background image
        if (typeof Userconfig.backgroundImageSrc !== 'undefined') {
            config.backgroundImageSrc = Userconfig.backgroundImageSrc;
        }

        if (Array.isArray(Userconfig.CustomTypes)) {
            this.types = Userconfig.CustomTypes;
        }

        for (i = 0; i < this.types.length; i++) {
            var selector = document.querySelectorAll('iframe[data-2click-type="'+this.types[i].type+'"]');

            var x;
            if(!getCookie(config.cookieNamespace+this.types[i].type)){
                for (x = 0; x < selector.length; x++) {
                    wrap(selector[x], document.createElement('div'), this.types[i].type, config.showContentDescription, config.backgroundImageSrc);
                }
            }else{
                for (x = 0; x < selector.length; x++) {
                    selector[x].src = selector[x].getAttribute("data-src");
                }
            }
        }

    };
}