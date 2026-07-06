frappe.ui.form.ControlDate = class ControlDate extends frappe.ui.form.ControlData {

  make_input () {
    super.make_input(); 
    this.set_date_options();
    this.set_datepicker();
    this.refresh();
  }
  format_for_input (value) {
    if (value) {
      return moment(value).format("YYYY-MM-DD");
    }
    return "";
  }

  set_formatted_input (value) {
    //  this._super(value);
      if (this.timepicker_only) return;
      // if (!this.datepicker) return;
       if (!value && value == undefined) {
           console.log("no value")
        this.$input.val("")
     
        return;
       }
  
      let should_refresh = this.last_value && this.last_value !== value;
  
      if (!should_refresh) {
        if (this.$input.calendarsPicker("getDate").length > 0) {
          // if date is selected but different from value, refresh
          
          const selected_date =this.format_for_input(new Date(this.$input.calendarsPicker("getDate")))
          
          
          should_refresh = selected_date !== value;
        } else {
          // if datepicker has no selected date, refresh
          should_refresh = true;
        }
      }
      if (should_refresh && value != undefined) {
        this.$input.calendarsPicker("setDate",this.format_for_input(value));
      }
    }
  
    parse (value) {
      if (value) {
        return this.format_for_input(value);
      }
    }

    set_date_options () {
      var me = this;
      // webformTODO:
      let sysdefaults = frappe.boot.sysdefaults;
  
      let lang = "en";
      frappe.boot.user && (lang = frappe.boot.user.language);
  
      // let date_format =
      //   sysdefaults && sysdefaults.date_format
      //     ? sysdefaults.date_format
      //    // : "yyyy-mm-dd";
      //    :    "dd-mm-yyyy";
      let date_format=  "yyyy-mm-dd";
      this.date_format = date_format;
  
      this.datepicker_options = {
        language: lang,
        dateFormat: date_format,
        onSelect: (dates) => {
          me.$input.trigger("change");
        }
      };
    }

    set_datepicker () {
      // this._super()
  
      if (this.isHijri()) {
        this.makeHijriDatePicker(this.datepicker_options);
      } else {
        this.makeDatePicker(this.datepicker_options);
      }
      
    }
  
    isHijri () {
      let hijri = this.df.fieldname.endsWith("hijri") || false;
      return hijri;
    }
  
    makeHijriDatePicker (ops) {
      this.$input.calendarsPicker({
        ...ops,
  
        calendar: $.calendars.instance("ummalqura", "ar")
      });
    }
    makeDatePicker (ops) {
      this.$input.calendarsPicker(ops);
    }
}

 
