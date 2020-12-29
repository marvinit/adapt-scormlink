define(function(require) {

    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');

    var Scormlink = ComponentView.extend({

        preRender: function () {

            var spoorConfig = Adapt.config.get('_spoor');
            if (spoorConfig && spoorConfig._isEnabled) {

                var scormLink = this.model.get('_scormlink');
                var fullLink;
                var emptyLink;

                try {
                    // add userid and username to string
                    fullLink = "<a target='" + scormLink.bodyTarget + "' " + "href='" + scormLink.bodyProtocol + "://" + scormLink.bodyURL + scormLink.bodyStudentName + encodeURIComponent(API.LMSGetValue('cmi.core.student_name')) + scormLink.bodyStudentId + encodeURIComponent(API.LMSGetValue('cmi.core.student_id')) + "'>" + scormLink.bodyText + "</a>";

                } catch (e) {
                    console.log('Something went wrong', e);
                    // Scorm not present, anonymous link
                    this.model.set('scormlinkbody', emptyLink);
                    fullLink = "<a target='" + scormLink.bodyTarget + "' " + "href='" + scormLink.bodyProtocol + "://" + scormLink.bodyNoScormURL + "'>" + scormLink.bodyText + "</a>";

                }
            }
            this.model.set('scormLinkBody', fullLink);

            this.checkIfResetOnRevisit();
        },

        postRender: function() {
            this.setReadyStatus();

            this.setupInview();
        },

        setupInview: function() {
            var selector = this.getInviewElementSelector();

            if (!selector) {
                this.setCompletionStatus();
            } else {
                this.model.set('inviewElementSelector', selector);
                this.$(selector).on('inview', _.bind(this.inview, this));
            }
        },

        /**
         * determines which element should be used for inview logic - body, instruction or title - and returns the selector for that element
         */
        getInviewElementSelector: function () {
            if (this.model.get('body')) return '.component-body';

            if(this.model.get('instruction')) return '.component-instruction';
            
            if(this.model.get('displayTitle')) return '.component-title';

            return null;
        },

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
            }
        },

        inview: function(event, visible, visiblePartX, visiblePartY) {
            if (visible) {
                if (visiblePartY === 'top') {
                    this._isVisibleTop = true;
                } else if (visiblePartY === 'bottom') {
                    this._isVisibleBottom = true;
                } else {
                    this._isVisibleTop = true;
                    this._isVisibleBottom = true;
                }

                if (this._isVisibleTop && this._isVisibleBottom) {
                    this.$(this.model.get('inviewElementSelector')).off('inview');
                    this.setCompletionStatus();
                }
            }
        },

        remove: function() {
            if(this.model.has('inviewElementSelector')) {
                this.$(this.model.get('inviewElementSelector')).off('inview');
            }
            
            ComponentView.prototype.remove.call(this);
        }
    },
    {
        template: 'scormlink'
    });

    Adapt.register('scormlink', Scormlink);

    return Scormlink;
});
