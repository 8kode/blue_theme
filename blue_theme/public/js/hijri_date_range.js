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
  set_date_options() {
    let sysdefaults = frappe.boot.sysdefaults;

    let lang = "en";
    frappe.boot.user && (lang = frappe.boot.user.language);

    // let date_format =
    //   sysdefaults && sysdefaults.date_format
    //     ? sysdefaults.date_format
    //     : "yyyy-mm-dd";
    let date_format = "yyyy-mm-dd";

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
  set_input: function (value, value2) {
    this.last_value = this.value;
    if (value && value2) {
      this.value = [value, value2];
    } else {
      this.value = value;
    }
    if (this.value) {
      let formatted = this.format_for_input(this.value[0], this.value[1]);
      this.$input && this.$input.val(formatted);
    } else {
      this.$input && this.$input.val("");
    }
    this.set_disp_area(value || "");
    this.set_mandatory && this.set_mandatory(value);
  },
  parse: function (value) {
    // replace the separator (which can be in user language) with comma
    const to = __("{0} to {1}").replace("{0}", "").replace("{1}", "");
    value = value.replace(to, ",");

    if (value && value.includes(",")) {
      var vals = value.split(",");
      var from_date =this.format_input(vals[0]);
    //    moment(frappe.datetime.user_to_obj(vals[0])).format(
    //     "YYYY-MM-DD"
    //   );
      var to_date =this.format_input(vals[vals.length - 1])
    //    moment(
    //     frappe.datetime.user_to_obj(vals[vals.length - 1])
    //   ).format("YYYY-MM-DD");
    //   moment(vals[vals.length - 1]).format("YYYY-MM-DD");
      return [from_date, to_date];
    }
  },
  format_for_input: function (value1, value2) {
    if (value1 && value2) {
        value1 = this.format_input(value1);
        value2 = this.format_input(value2);
        // value1 = frappe.datetime.str_to_user(value1);
        // value2 = frappe.datetime.str_to_user(value2);
        return __("{0} to {1}", [value1, value2]);
    }
    return "";
  },
  format_input: function (value) {
    if (value) {
      return moment(value).format("YYYY-MM-DD");
    }
    return "";
  },
});
