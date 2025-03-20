import { Accordion }         from './NexaAccordion.js';
import { Alerts }            from './NexaAlerts.js';
import { buttonGroups }      from './NexaBtnGroups.js';
import { initCarousels }     from './NexaCarousel.js';
import { Collapse }          from './NexaCollapse.js';
import { Dropdown }          from './NexaDropdown.js';
import { Lightbox }          from './NexaLightbox.js';
import { SidebarMenu }       from './NexaSidebar.js';
import { ListGroup }         from './NexaListGroup.js';
import { Offcanvas }         from './NexaOffcanvas.js';
import { Popover }           from './NexaPopover.js';
import { Progress }          from './NexaProgress.js';
import { Scrollspy }         from './NexaScrollspy.js';
import { initializeSearch }  from './NexaSearch.js';
import { Sortable }          from './NexaSortable.js';
import { Toast }             from './NexaToast.js';
import { Tooltips }          from './NexaTooltips.js';
import {NexaMode}            from './NexaMode.js';
export function NexaElement() {
  return {
        Mode: function () {
          return new NexaMode();
        },
        Accordion: function () {
          return Accordion();
        },
        Alerts: function () {
           return Alerts();
        },
        buttonGroups: function () {
          return buttonGroups();
        },
        Carousel: function () {
          return initCarousels();
        },
        Collapse: function () {
          return Collapse();
        },
        Dropdown: function () {
           return Dropdown();
        },
        Lightbox: function () {
          return new Lightbox();
        },
        Sidebar: function () {
           return new SidebarMenu();
        },
        ListGroup: function () {
          return new ListGroup();
        },
        Offcanvas: function () {
          return new Offcanvas();
        },
        Popover: function () {
           return new Popover();
        },
        Progress: function () {
           return Progress();
        },
        Scrollspy: function () {
           return Scrollspy();
        },
        Search: function () {
           return initializeSearch();
        },
        Sortable: function () {
           return new Sortable();
        },
        Toast: function () {
           return Toast();
        },
        Tooltips: function () {
           return Tooltips();
        },

  };
}