frappe.ui.form.ControlDateRange = frappe.ui.form.ControlData.extend({
  make_input: function () {
    this._super();
    this.set_date_options();
    this.set_datepicker();
    this.refresh();
  },
  isHijri: function () {
    let hijri = this.df.fieldname.endsWith("hijri") || false;
    return hijri;
  },
  set_date_options(){
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
      rangeSelect: true,
      rangeSeparator: ",",
      onSelect: () => {
        me.$input.trigger("change");
      }
    };
  },
  set_datepicker() {
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
  },
  parse: function (value) {
    // replace the separator (which can be in user language) with comma
    const to = __("{0} to {1}").replace("{0}", "").replace("{1}", "");
    value = value.replace(to, ",");

    if (value && value.includes(",")) {
      var vals = value.split(",");

      let hijri = this.df.fieldname.endsWith("hijri") || false;
      var from_date = "";
      var to_date = "";
      if (hijri) {
        from_date = vals[0];
        to_date = vals[vals.length - 1];
      } else {
        from_date = moment(frappe.datetime.user_to_obj(vals[0])).format(
          "YYYY-MM-DD"
        );
        to_date = moment(
          frappe.datetime.user_to_obj(vals[vals.length - 1])
        ).format("YYYY-MM-DD");
      }

      return [from_date, to_date];
    }
  },
  set_input(value, value2) {
    return [value, value2];
  }
});
