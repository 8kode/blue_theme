
async function get_defualt_company() {

    let company =""
   
     await frappe.call({
        "method": "communication_management.global_func.get_defualt_company",
        callback(r) {
            company=r.message
       
        },
        async: true,
    })
    // console.log(company)
    return company
}

async function get_company_phone_info() {
    let title =""
   
    await frappe.call({
        "method": "communication_management.global_func.get_company_phone_info",
        callback(r) {
            title=r.message
       
        },
        async: true,
    })
    // console.log(title)

    return title
}

