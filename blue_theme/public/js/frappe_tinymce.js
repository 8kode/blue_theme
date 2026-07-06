
frappe.ui.form.ControlTextEditor = class ControlTextEditor extends frappe.ui.form.ControlCode {
    make_wrapper() {
        super.make_wrapper();
    }

    make_input() {
        this.has_input = true;
        this.make_quill_editor();
    }

    make_quill_editor() {
        // if (this.quill) return;
        // this.quill = new Quill(this.quill_container[0], this.get_quill_options());
        // this.bind_events();
        const that = this
        this.quill_container = $('<div>').appendTo(this.input_area);
        tinymce.init({
            language: "ar",
            target: this.input_area,
            toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons  | a11ycheck ltr rtl | showcomments addcomment | footnotes | mergetags',
            font_size_formats: '10px 11px 12px 14px 15px 16px 18px 24px 36px',
            font_family_formats: 'cairo=cairo,monospace;' + 'DecoType Naskh=DecoType Naskh,monospace;' + 'DecoType Naskh Extensions=DecoType Naskh Extensions,monospace;' + 'DecoType Naskh Variants=DecoType Naskh Variants,monospace;' + 'Andale Mono=andale mono,monospace;' + 'Arial=arial,helvetica,sans-serif;' + 'Arial Black=arial black,sans-serif;' + 'Book Antiqua=book antiqua,palatino,serif;' + 'Comic Sans MS=comic sans ms,sans-serif;' + 'Courier New=courier new,courier,monospace;' + 'Georgia=georgia,palatino,serif;' + 'Helvetica=helvetica,arial,sans-serif;' + 'Impact=impact,sans-serif;' + 'Symbol=symbol;' + 'Tahoma=tahoma,arial,helvetica,sans-serif;' + 'Terminal=terminal,monaco,monospace;' + 'Times New Roman=times new roman,times,serif;' + 'Trebuchet MS=trebuchet ms,geneva,sans-serif;' + 'Verdana=verdana,geneva,sans-serif;' + 'Webdings=webdings;' + 'Wingdings=wingdings,zapf dingbats',
            // toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl | showcomments addcomment | footnotes | mergetags',
            // font_size_formats: '10px 11px 12px 14px 15px 16px 18px 24px 36px',
            plugins: [
                'autoresize', 'autolink', 'charmap',
                //    'emoticons',
                'fullscreen', 'help',
                //   'image',
                //    'link',
                'lists', 'searchreplace',
                'table', 'visualblocks', 'visualchars', 'wordcount',
            ],
            // font_formats: '"DecoType Naskh", sans-serif',
            powerpaste_googledocs_import: "prompt",
            entity_encoding: 'raw',
            convert_urls: true,
            content_css: false,
            toolbar_sticky: false,
            promotion: false,
            link_default_target: "_blank",

            setup: function (editor) {
                that.editor_id = editor.id
                window.editor=editor
                // console.log(editor)
                    editor.on('Change', function (e) {
                        // console.log(e)
                        that.parse_validate_and_set_in_model(e.level.content);
                    });
               

                editor.on('init', function (e) {
                    editor.setContent(that.value);
                });

                editor.addShortcut("meta+s", "", function () {
                    // cur_frm.fields_dict.details.activeEditor.addShortcut("meta+s","",function(){
                    frappe.app.trigger_primary_action();
                    // e.preventDefault();
                    return false;
                })
            }
        });

        this.activeEditor = tinymce.activeEditor
    }

    set_formatted_input(value) {
        // if (this.frm && !this.frm.doc.__setContent) {
        if (this.doc && !this.doc.__setContent) {
            if (value) {
                this.activeEditor.setContent(value)
            } else {
                this.activeEditor.setContent("")
            }
        }
        // console.log(this)
        // this.frm.doc.__setContent = 1
        this.doc.__setContent = 1

    }
}
