from . import __version__ as app_version

app_name = "blue_theme"
app_title = "Blue Theme"
app_publisher = "abdulaziz algbri"
app_description = "blue"
app_email = "aljbriabdulaziz@gmail.com"
app_license = "MIT"
app_logo_url = "/assets/blue_theme/images/splash.png"

# Includes in <head>
# ------------------
app_include_css = ["/assets/blue_theme/css/fonts.css","blue_theme.bundle.css",
                   "/assets/blue_theme/css/redmond.calendars.picker.css"]
# web_include_css = ["/assets/blue_theme/css/fonts.css","blue_theme_web.bundle.css","meridian_login.css"]

web_include_css = [
    "/assets/blue_theme/css/fonts.css",
    "blue_theme_web.bundle.css",
    # "/assets/blue_theme/css/meridian_login.css"
]


# # جافا سكربت للثيم
# app_include_js = "/assets/blue_theme/js/meridian-ux-enhancements.js"
# app_include_js = "/assets/blue_theme/js/meridian-workspace-sidebar.js"




# Bundle into the Desk (authenticated app)
# app_include_css = [
#     "/assets/blue_theme/css/meridian.css",
# ]
# app_include_js = [
#     "/assets/blue_theme/js/meridian.js",
# ]

# # Also bundle into public website pages
# web_include_css = [
#     "/assets/blue_theme/css/meridian.css",
# ]
# web_include_js = [
#     "/assets/blue_theme/js/meridian.js",
# ]




#always comments
# app_include_js=["blue_theme.bundle.js","/assets/blue_theme/js/tinymce/tinymce.js"]
# app_include_js = "/assets/blue_theme/js/app.js"
#
#newUpdate
# Desk assets — injected on every Desk page, survives ERPNext updates
# app_include_css = ["/assets/blue_theme/css/premium.css"]
# app_include_js = ["/assets/blue_theme/js/premium.js"]

# # Website / portal / login pages
# web_include_css = ["/assets/blue_theme/css/premium.css"]
# web_include_js = ["/assets/blue_theme/js/premium.js"]

#endUpdate



website_context = {
	"favicon": "/assets/blue_theme/images/splash.png",
	# "splash_image": "/assets/blue_theme/images/splash.png",
}
# include js, css files in header of desk.html
# app_include_css = "/assets/blue_theme/css/blue_theme.css"
# app_include_js = "/assets/blue_theme/js/blue_theme.js"

# include js, css files in header of web template
# web_include_css = "/assets/blue_theme/css/blue_theme.css"
web_include_js = "editorjs.bundle.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "blue_theme/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "blue_theme.utils.jinja_methods",
#	"filters": "blue_theme.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "blue_theme.install.before_install"
# after_install = "blue_theme.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "blue_theme.uninstall.before_uninstall"
# after_uninstall = "blue_theme.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "blue_theme.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"blue_theme.tasks.all"
#	],
#	"daily": [
#		"blue_theme.tasks.daily"
#	],
#	"hourly": [
#		"blue_theme.tasks.hourly"
#	],
#	"weekly": [
#		"blue_theme.tasks.weekly"
#	],
#	"monthly": [
#		"blue_theme.tasks.monthly"
#	],
# }

# Testing
# -------

# before_tests = "blue_theme.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "blue_theme.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "blue_theme.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["blue_theme.utils.before_request"]
# after_request = ["blue_theme.utils.after_request"]

# Job Events
# ----------
# before_job = ["blue_theme.utils.before_job"]
# after_job = ["blue_theme.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"blue_theme.auth.validate"
# ]
