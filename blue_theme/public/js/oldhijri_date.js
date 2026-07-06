frappe.ui.form.ControlDate = frappe.ui.form.ControlDate.extend({
  make_input: function () {
    this._super();
    this.set_date_options();
    this.set_datepicker();
  },

  isHijri: function () {
    let hijri = this.df.fieldname.endsWith("hijri") || false;
    return hijri;
  },

  set_date_options: function () {
    // webformTODO:
    let sysdefaults = frappe.boot.sysdefaults;

    let lang = "en";
    frappe.boot.user && (lang = frappe.boot.user.language);

    let date_format =
      sysdefaults && sysdefaults.date_format
        ? sysdefaults.date_format
        : "yyyy-mm-dd";

    this.date_format = date_format;

    var me = this;
    this.datepicker_options = {
      language: lang,
      dateFormat: date_format,
      onSelect: () => {
        me.$input.trigger("change");
      }
    };
  },
  set_datepicker: function () {
    if (this.isHijri()) {
      this.makeHijriDatePicker(this.datepicker_options);
    } else {
      this.makeDatePicker(this.datepicker_options);
    }
  },
  makeHijriDatePicker: function (ops) {
    var me = this;
    this.$input.calendarsPicker({
      ...ops,

      calendar: $.calendars.instance("ummalqura", "ar")
    });
  },
  makeDatePicker: function (ops) {
    this.$input.calendarsPicker(ops);
  }
});
