#!/usr/bin/env python3
"""Build the fictional Westford Jobs seed. Employers, wages and dates are invented."""

import json
from pathlib import Path

PLACES = {
    "Ealing": ("London", "W5 3HJ"),
    "West Ealing": ("London", "W13 9AB"),
    "Acton": ("London", "W3 6QE"),
    "Southall": ("London", "UB1 1RH"),
    "Hanwell": ("London", "W7 2DP"),
    "Greenford": ("London", "UB6 8UF"),
    "Hounslow": ("London", "TW3 1ES"),
    "Brentford": ("London", "TW8 8JW"),
    "Hammersmith": ("London", "W6 9DJ"),
    "Wembley": ("London", "HA9 6BH"),
    "Harrow": ("London", "HA1 2EF"),
    "Hayes": ("London", "UB3 4AJ"),
    "Feltham": ("London", "TW13 4EX"),
    "Richmond": ("London", "TW9 1AE"),
    "Uxbridge": ("London", "UB8 1HS"),
    "Leeds": ("Leeds", "LS1 4DY"),
    "Manchester": ("Manchester", "M1 2WD"),
    "Birmingham": ("Birmingham", "B1 1AA"),
    "Bristol": ("Bristol", "BS1 4ST"),
    "Cardiff": ("Cardiff", "CF10 1EP"),
    "Glasgow": ("Glasgow", "G1 3NU"),
    "Liverpool": ("Liverpool", "L1 8JQ"),
    "Nottingham": ("Nottingham", "NG1 5FS"),
    "Reading": ("Reading", "RG1 1JX"),
    "Slough": ("Slough", "SL1 1EL"),
    "Brighton": ("Brighton", "BN1 1GE"),
    "Sheffield": ("Sheffield", "S1 2HE"),
    "Leicester": ("Leicester", "LE1 5YA"),
    "Coventry": ("Coventry", "CV1 2WT"),
    "Oxford": ("Oxford", "OX1 1BX"),
    "Cambridge": ("Cambridge", "CB1 2JD"),
    "Newcastle": ("Newcastle", "NE1 4ST"),
    "Southampton": ("Southampton", "SO14 2AQ"),
    "Croydon": ("London", "CR0 1YS"),
}

# title, employer, category, town, experience, hours, contract, workplace,
# pay period, min, max, hours/week, pattern, sponsorship, condition,
# summary, responsibilities, essential, desirable, qualification, benefits, how, apprenticeship, keywords
# None condition when sponsorship is not offered.

def row(*parts):
    return parts

PINNED = [
    row(
        "Office administrator", "Larch Ledger", "administration", "Ealing", "entry", "full-time", "permanent", "on-site",
        "year", 24200, 24200, 37.5, "Monday to Friday, 9:00am to 5:00pm, with 30 minutes unpaid for lunch",
        "not-offered", None,
        "Keep the purchase invoices, the visitor book and the shared inbox for a small timber merchant in Ealing. Training is given on the spreadsheet they already use.",
        ["File supplier invoices and match them to delivery notes", "Reply to straightforward email enquiries and pass the rest to the manager", "Book meeting rooms and order stationery when the cupboard runs low"],
        ["No previous paid employment is needed", "Able to use email and a word processor", "Careful enough to check names and amounts before you save them"],
        ["Experience of answering a shop or office phone", "A GCSE or equivalent in English or maths"],
        "No formal qualification is required.",
        ["28 days of holiday including bank holidays", "A staff discount in the timber yard"],
        "Select Apply now and complete the practice form. Larch Ledger does not want a paper CV for this practice advert.",
        False, ["no previous experience", "office"],
    ),
    row(
        "Office administrator", "Holt and Penny", "administration", "Acton", "some", "full-time", "permanent", "on-site",
        "year", 27400, 27400, 37.5, "Monday to Friday, 8:45am to 5:15pm",
        "not-offered", None,
        "Run the office diary and the client billing spreadsheet for a two-partner surveyors' practice. This is a busier desk than a first office job.",
        ["Prepare draft invoices from the surveyors' timesheets", "Arrange access visits and confirm them in writing", "Keep the filing room in order for audits"],
        ["At least two years of paid office experience", "Confident with email, spreadsheets and a shared calendar", "Able to work without a script when a client is waiting"],
        ["Experience in property, construction or professional services", "A Level 2 business administration certificate"],
        "A formal qualification is not required if you have the two years of office experience.",
        ["25 days of holiday plus bank holidays", "Season-ticket loan after six months"],
        "Select Apply now. Use practice details only. The form is not emailed to Holt and Penny.",
        False, ["two years"],
    ),
    row(
        "Accounts assistant", "Marlow Figures", "finance", "Hammersmith", "some", "full-time", "permanent", "hybrid",
        "year", 26800, 28600, 37.5, "Monday to Thursday in the Hammersmith office, Friday from home",
        "available", "AAT Level 2, or one year of paid accounts work",
        "Post purchase invoices and reconcile the supplier accounts for a fictional bookkeeping practice. You will not give clients tax advice.",
        ["Enter invoices and match them to payments", "Prepare a weekly list of overdue supplier bills", "Answer email questions from the two senior bookkeepers"],
        ["AAT Level 2, or one year of paid accounts work", "Accurate numeric work", "Able to explain a figure in plain English"],
        ["Experience of a named accounts package", "AAT Level 3 study in progress"],
        "AAT Level 2, or one year of paid accounts work.",
        ["Study support towards the next AAT level", "Hybrid working on Fridays"],
        "Select Apply now and describe the qualification or the year of accounts work in the practice form.",
        False, ["bookkeeping"],
    ),
    row(
        "Receptionist", "Acton Gate Rooms", "administration", "Acton", "entry", "part-time", "permanent", "on-site",
        "hour", 12.5, 12.5, 18, "Wednesday to Friday, 9:00am to 3:00pm",
        "not-offered", None,
        "Meet visitors at a small serviced-office building and keep the meeting-room screen working. The building manager handles contracts.",
        ["Sign visitors in and offer them a seat", "Answer the front-desk phone and take a clear message", "Tell the building manager if a room has been left in a mess"],
        ["No previous paid employment is needed", "A welcoming manner and clear spoken English", "Happy to stay at a desk for most of the shift"],
        ["Any reception, shop or volunteer front-desk experience", "Basic computer use"],
        "No formal qualification is required.",
        ["Uniform is provided", "Free tea and coffee"],
        "Select Apply now. There is no separate email address for this practice vacancy.",
        False, ["front desk", "reception"],
    ),
    row(
        "Warehouse operative", "Greenford Bond Stores", "warehouse", "Greenford", "entry", "full-time", "permanent", "on-site",
        "hour", 13.05, 13.05, 40, "Monday to Friday, 7:00am to 3:30pm",
        "not-offered", None,
        "Pick household goods in a dry warehouse beside the A40. You will be shown how to use the scanner on your first two shifts.",
        ["Pick orders with a handheld scanner", "Wrap parcels and place them on the correct cage", "Report damaged stock before it is loaded"],
        ["No previous warehouse job is required", "Able to stand and walk for most of a shift", "Able to lift 12kg with the trolley provided"],
        ["A forklift licence", "Any shop or stockroom experience"],
        "No formal qualification is required.",
        ["Safety boots are provided", "Overtime is offered before Christmas and is optional"],
        "Select Apply now. Do not send identity documents with the practice application.",
        False, ["picker", "packer"],
    ),
    row(
        "Customer service adviser", "Southall Connect", "customer-service", "Southall", "entry", "full-time", "permanent", "on-site",
        "year", 24500, 24500, 37.5, "Tuesday to Saturday, 10:00am to 6:00pm. A rota is published two weeks ahead.",
        "not-offered", None,
        "Answer phone and web-chat questions about a fictional broadband service. You work from a script at first, then handle simple changes yourself.",
        ["Answer calls and chat messages about bills and appointments", "Record what the customer agreed", "Pass technical faults to the network team"],
        ["No previous call-centre job is required", "Clear spoken English", "Patient when someone is worried or cross"],
        ["Another language used in Southall", "Experience of shop or reception work"],
        "No formal qualification is required. Call handling is taught in the first fortnight.",
        ["24 days of holiday", "Headset and locker provided"],
        "Select Apply now and complete every step of the practice form, including the review page.",
        False, ["call centre", "broadband"],
    ),
    row(
        "Care support worker", "Hanwell Orchard Home", "care", "Hanwell", "some", "full-time", "permanent", "on-site",
        "hour", 14.2, 14.2, 36, "Three days on and two days off, including some weekends. Shifts are 7:00am to 7:30pm.",
        "not-offered", None,
        "Support older residents with meals, company and personal care in a fictional care home. A senior carer is on every shift.",
        ["Help residents wash, dress and eat", "Write short notes in the care record after each visit", "Notice changes and tell the nurse in charge"],
        ["At least six months of paid care work, or a completed Care Certificate", "Respectful and discreet", "Able to follow a care plan"],
        ["A driving licence is not needed. The home is on a bus route.", "Experience with people living with dementia"],
        "A Care Certificate is required. If yours is still in progress, say so. A nursing qualification is not required.",
        ["Pension", "Paid breaks on the long shift"],
        "Select Apply now. This practice form does not ask for a DBS certificate number. Read the advert before you decide.",
        False, ["personal care"],
    ),
    row(
        "IT support technician", "Wembley Deskworks", "it", "Wembley", "experienced", "full-time", "permanent", "on-site",
        "year", 34000, 36000, 37.5, "Monday to Friday, 8:30am to 5:00pm, plus a Saturday rota once a month",
        "available", "CompTIA A+, or two years of paid IT support work",
        "Second-line support for laptops, printers and the ticket queue in a fictional managed-service company. You visit client offices in Wembley and Harrow.",
        ["Work through the ticket queue and record what you changed", "Set up laptops and show staff how to sign in", "Escalate faults you cannot close the same day"],
        ["CompTIA A+, or two years of paid IT support work", "Able to explain a fix without jargon", "Happy to travel between two sites on the bus or by bike"],
        ["Experience of Microsoft 365", "A driving licence"],
        "CompTIA A+, or two years of paid IT support work.",
        ["Certification renewal is paid after a year", "A laptop is provided"],
        "Select Apply now and name the qualification or the two years of support work in the practice form.",
        False, ["helpdesk"],
    ),
    row(
        "Marketing assistant", "Ealing Poster Press", "marketing", "Ealing", "entry", "full-time", "fixed-term", "hybrid",
        "year", 25000, 25000, 37.5, "Monday to Friday, 9:30am to 5:30pm, for a 12-month contract. One day a week from home after the first month.",
        "not-offered", None,
        "Draft social-media posts and simple event listings for a fictional community publisher. A senior editor checks everything before it is published.",
        ["Write short posts from notes the editor provides", "Update event dates on the website", "Keep a list of which posts were published each week"],
        ["No previous marketing job is required", "Careful spelling", "Comfortable using email and a web browser"],
        ["A personal blog, college newsletter or volunteer social-media account", "A marketing course, even if unfinished"],
        "No formal qualification is required.",
        ["The 12-month contract may be extended, but that is not promised", "A press pass is not part of this role"],
        "Select Apply now. Paste a short practice example of your writing into the application. Do not send files to an outside address.",
        False, ["social media"],
    ),
    row(
        "Administration apprentice", "West Ealing Parish Office", "administration", "West Ealing", "entry", "full-time", "fixed-term", "on-site",
        "year", 16000, 16000, 37.5, "Monday to Friday, 9:00am to 5:00pm, for an 18-month apprenticeship",
        "not-offered", None,
        "An apprenticeship in business administration at a fictional parish office. One day a week is spent with the training provider. You are employed, not a volunteer.",
        ["Greet visitors and keep the room diary", "File minutes and type short letters from notes", "Attend the off-the-job training day"],
        ["No previous paid employment is needed", "Willing to study as part of the job", "Able to travel to the training centre in Ealing"],
        ["Any school or college office experience", "An interest in community work"],
        "English and maths at a level that lets you start the apprenticeship. Support is available if you need to keep studying them.",
        ["Apprentice wage, rising after the first year", "The training course is paid by the employer in this practice advert"],
        "Select Apply now. Say that you are applying for the apprenticeship, not a qualified administrator post.",
        True, ["apprenticeship", "training"],
    ),
    row(
        "Cleaner", "Brentford Key Rooms", "cleaning", "Brentford", "entry", "part-time", "permanent", "on-site",
        "hour", 12.21, 12.21, 16, "Monday to Friday, 6:00am to 9:15am",
        "not-offered", None,
        "Clean kitchens and meeting rooms in a small office block before the tenants arrive. Products and a trolley are provided.",
        ["Empty bins and wipe desks and kitchen surfaces", "Vacuum the corridors and mop the kitchen floor", "Lock the cupboard and sign the cleaning sheet"],
        ["No previous cleaning job is required", "Able to start at 6:00am", "Careful with keys"],
        ["Experience of cleaning offices, hotels or schools", "A first-aid certificate"],
        "No formal qualification is required. COSHH training is given on the first day.",
        ["Uniform provided", "Extra hours are sometimes available and are optional"],
        "Select Apply now. The practice form is the whole application.",
        False, ["early morning", "facilities"],
    ),
    row(
        "Security officer", "Hounslow Gate Watch", "security", "Hounslow", "some", "full-time", "permanent", "on-site",
        "hour", 14.8, 14.8, 42, "12-hour shifts on a four-on, four-off pattern, including nights",
        "not-offered", None,
        "Staff the gate of a fictional storage park. You check passes, walk the fence and write a shift log. You do not chase people.",
        ["Check passes and record vehicle numbers", "Walk the site and report anything unusual", "Hand over clearly to the next officer"],
        ["A current SIA door supervisor or security guard licence", "Able to work nights and weekends on the rota", "Calm when a driver is in a hurry"],
        ["Experience of a gatehouse or retail security", "A first-aid certificate"],
        "A current SIA licence is required before you start. This employer does not pay for the first licence.",
        ["Boots and a radio are provided", "Night premium is included in the hourly rate"],
        "Select Apply now and state that the SIA licence is part of the practice scenario. Do not type a real licence number.",
        False, ["SIA", "gatehouse"],
    ),
    row(
        "Production operative", "Canal Side Packing", "manufacturing", "Greenford", "entry", "full-time", "permanent", "on-site",
        "hour", 13.15, 13.15, 40, "Monday to Thursday, 6:00am to 4:00pm",
        "not-offered", None,
        "Pack bottled sauces on a short production line. The line supervisor shows you the checks. The work is repetitive and on your feet.",
        ["Place bottles in cases and seal the cases", "Watch for leaking caps and stop the line if you see one", "Keep your bench clear at the end of the shift"],
        ["No previous factory job is required", "Comfortable with repetitive work", "Able to follow a hygiene rule about hair, jewellery and hand washing"],
        ["Any food-production experience", "A forklift licence"],
        "No formal qualification is required. A food-hygiene briefing is given before you touch the product.",
        ["Protective clothing is provided and must stay on site", "Free breakfast at the first break"],
        "Select Apply now. Read the early start time before you submit the practice form.",
        False, ["factory", "packing"],
    ),
    row(
        "Construction labourer", "Southall Siteworks", "construction", "Southall", "entry", "full-time", "temporary", "on-site",
        "hour", 14.5, 14.5, 40, "Monday to Friday, 7:30am to 4:00pm, for a 16-week site",
        "not-offered", None,
        "Help tradespeople on a fictional school-extension site: moving materials, keeping walkways clear and mixing as directed. You will not work alone at height.",
        ["Move materials with a trolley or with a colleague", "Keep pathways clear of offcuts", "Follow the site supervisor's instructions"],
        ["No previous site experience is required", "Willing to work outdoors in poor weather", "Able to take a site induction seriously"],
        ["A CSCS card", "Any labouring or warehouse experience"],
        "A CSCS card is not required on day one. The practice employer says it will book the test during the first fortnight if you do not have one.",
        ["Helmet, boots and a vest are provided", "The job ends when this site ends"],
        "Select Apply now. The closing date is on the advert. This temporary role does not become permanent automatically.",
        False, ["CSCS", "site"],
    ),
    row(
        "HR administrator", "Hammersmith People File", "hr", "Hammersmith", "some", "full-time", "permanent", "hybrid",
        "year", 28000, 28000, 37.5, "Monday to Friday, 9:00am to 5:30pm. Two days a week in the office.",
        "not-offered", None,
        "Look after starter paperwork and the holiday spreadsheet for a fictional charity with 40 staff. You do not give employment-law advice.",
        ["Prepare starter packs and check they have been returned", "Record holidays and sick leave on the spreadsheet", "Book rooms for interviews and greet candidates"],
        ["At least one year in an office, HR or reception role", "Discreet with personal information", "Confident with email and spreadsheets"],
        ["Experience of an HR system", "A CIPD qualification, which is not required"],
        "No CIPD qualification is required for this administrator post.",
        ["27 days of holiday", "A pension contribution is described in the staff handbook, which you can read after a practice offer"],
        "Select Apply now. Do not attach real staff records or identity documents.",
        False, ["human resources", "starters"],
    ),
    row(
        "Delivery driver", "Hounslow Parcel Loop", "driving", "Hounslow", "some", "full-time", "permanent", "on-site",
        "hour", 14.25, 14.25, 40, "Tuesday to Saturday, 8:00am to 4:30pm. Routes finish at the Hounslow depot.",
        "not-offered", None,
        "Deliver parcels on a planned round in a small van. The van is supplied. You need a full driving licence before you apply.",
        ["Load the van in route order", "Deliver parcels and record them on the handheld", "Report failed deliveries the same day"],
        ["A full UK car driving licence held for at least one year", "No more than six penalty points", "Able to lift parcels up to 15kg"],
        ["Van driving experience", "Knowledge of Hounslow and Feltham"],
        "A driving licence is essential. A CPC or HGV licence is not required.",
        ["The van, fuel and insurance are provided", "A phone for the route app is provided"],
        "Select Apply now. Type a practice licence sentence such as 'full licence'. Do not enter a real driving-licence number.",
        False, ["van", "parcels"],
    ),
    row(
        "Receptionist", "Wembley Hall Clinic", "administration", "Wembley", "some", "full-time", "permanent", "on-site",
        "year", 25500, 25500, 37.5, "Monday to Friday, 8:30am to 5:00pm",
        "not-offered", None,
        "Run the front desk of a fictional private clinic: appointments, payments and a calm waiting room. Clinical questions go to the nurse.",
        ["Book and change appointments on the clinic system", "Take card payments for consultations", "Keep the waiting room tidy and tell a nurse if someone seems unwell"],
        ["At least two years of reception experience", "Confident taking payments and giving change or a receipt", "Discreet about patients"],
        ["Experience in a clinic, dental practice or optician", "Another language"],
        "No clinical qualification is required. You will not give medical advice.",
        ["Uniform provided", "Staff eye-test discount at the sister practice, which is also fictional"],
        "Select Apply now and use fictional patient examples if you describe your experience.",
        False, ["clinic", "appointments"],
    ),
    row(
        "Chef de partie", "Brentford Lock Kitchen", "hospitality", "Brentford", "experienced", "full-time", "permanent", "on-site",
        "year", 32000, 34000, 45, "Tuesday to Saturday, split shifts on Friday and Saturday. The kitchen closes at 10:00pm.",
        "not-offered", None,
        "Run the sauce section in a fictional restaurant kitchen during service. This is not a training post.",
        ["Prepare your section before service", "Cook the dishes on your section to the menu spec", "Clean down and note what the next shift must order"],
        ["At least three years in a busy kitchen, including time as a chef de partie or equivalent", "A Level 2 food hygiene certificate", "Able to work split shifts and weekends"],
        ["Experience of a similar British or European menu", "A Level 3 food hygiene certificate"],
        "A Level 2 food hygiene certificate is required. A culinary degree is not.",
        ["Staff meal on shift", "Knife kit is your own"],
        "Select Apply now. Read the weekend split shifts before you decide the job is suitable.",
        False, ["chef", "kitchen"],
    ),
    row(
        "Kitchen assistant", "Hanwell Supper Club", "hospitality", "Hanwell", "entry", "part-time", "permanent", "on-site",
        "hour", 12.21, 12.21, 16, "Thursday to Saturday, 5:00pm to 10:30pm",
        "not-offered", None,
        "Wash up, prep vegetables and plate desserts in a small fictional dining room. The chef cooks. You do not run a section.",
        ["Wash pots and keep the pass clear", "Prepare vegetables from a written list", "Help plate cold desserts during service"],
        ["No previous paid employment is needed", "Able to work the three evening shifts", "Comfortable in a hot kitchen"],
        ["Any cafe or school-kitchen experience", "A food hygiene certificate"],
        "No formal qualification is required. Food hygiene training is given before the first service.",
        ["A staff meal each shift", "Tips are shared and are not guaranteed"],
        "Select Apply now. The practice application is not sent to the kitchen.",
        False, ["no previous experience", "evenings"],
    ),
    row(
        "Office support assistant", "Southall Filing Room", "administration", "Southall", "entry", "part-time", "temporary", "on-site",
        "hour", 12.4, 12.4, 20, "Monday to Friday, 9:00am to 1:00pm, for 10 weeks",
        "not-offered", None,
        "Sort paper files for a fictional solicitor while they move rooms. The work is mostly on paper. You will not be asked to give legal advice or to use a casework system.",
        ["Sort files into the order on the list", "Label boxes and stack them on a trolley", "Ask the office manager when a file does not match the list"],
        ["No previous paid employment is needed", "No computer skills are required for this temporary task", "Able to lift a file box with a colleague"],
        ["Any experience of sorting post or stock", "A driving licence is not needed"],
        "No formal qualification is required.",
        ["This temporary job ends after 10 weeks", "Tea and a locker are provided"],
        "Select Apply now. Read the line that says computer skills are not required, and compare it with other office jobs.",
        False, ["filing", "no computer"],
    ),
]


def shift(kind, hours):
    patterns = {
        "days": "Monday to Friday, 9:00am to 5:00pm",
        "earlies": "Monday to Friday, 7:00am to 3:00pm",
        "lates": "Monday to Friday, 12:00pm to 8:00pm",
        "nights": "Sunday to Thursday, 10:00pm to 6:00am",
        "weekends": "Wednesday to Sunday, 10:00am to 6:00pm",
        "mornings": "Monday to Friday, 8:00am to 12:00pm",
        "evenings": "Thursday to Sunday, 5:00pm to 10:00pm",
        "term": "Monday to Friday, 8:30am to 3:30pm, term time only",
        "four": "Four days on, four days off, including weekends",
        "hybrid": "Monday to Friday, 9:00am to 5:30pm, with one home day after training",
    }
    text = patterns[kind]
    if hours == "part-time" and kind == "days":
        text = "Monday to Friday, 9:00am to 1:00pm"
    return text


def bulk():
    # Each line is one distinct practice vacancy. Fields are separated by ||.
    # pay is hour:12.50 or year:24000 or year:24000-26000. sponsor is - or the exact condition.
    raw = """
Office coordinator || Maple Row Offices || administration || West Ealing || some || full-time || permanent || on-site || year:26100 || days || You coordinate room bookings and supplier visits for a fictional managed-office floor in West Ealing. || Confirm each booking and meet the visitor at the lift || Chase late supplier invoices once a week || Update the fire-list when a tenant moves desk || At least one year of office or reception work || Confident with a shared calendar || Able to interrupt politely when a room overruns || Experience of a serviced office || A business administration certificate || No formal qualification is required if you have the year of office work.
Clerical assistant || Hanwell Deed Desk || administration || Hanwell || entry || part-time || permanent || on-site || hour:12.60 || mornings || Copy plans and prepare envelopes for a fictional architectural practice that still keeps a paper set. || Scan signed drawings into the named folder || Address envelopes from a checked list || Tell the office manager when the scanner jams || No previous paid employment is needed || Able to follow a filing list || Comfortable standing at a scanner || Any library or shop experience || GCSE English || No formal qualification is required.
School office assistant || Greenford Meadow School || administration || Greenford || entry || part-time || permanent || on-site || hour:13.10 || term || Answer the late book and the visitor screen at a fictional primary school during term time. || Record pupils who arrive after the bell || Give visitors a badge and call the right teacher || Sort the afternoon post into class trays || No previous school-office job is required || Patient with parents who are in a hurry || Discreet about pupils || Any work with children or families || A school-office qualification || No formal qualification is required. Term-time hours mean you are not paid for school holidays.
Lettings administrator || Brentford Key Lets || administration || Brentford || some || full-time || permanent || on-site || year:27500 || days || Prepare tenancy packs and book viewings for a fictional local lettings desk. You do not give legal advice. || Arrange viewings and send the confirmation text || Check application forms are complete before a manager reads them || Order inventories from the clerk the practice uses || At least one year in an office, shop or agency || Careful with names, dates and deposits || Able to explain a viewing time clearly || Experience of property work || A qualification in housing || No formal qualification is required.
Data entry clerk || Wembley List House || administration || Wembley || entry || full-time || temporary || on-site || hour:12.80 || days || Type survey answers into a spreadsheet for a fictional research office. The project lasts fourteen weeks. || Enter answers exactly as they are written || Flag forms that are incomplete || Keep a count of what you have finished each day || No previous paid employment is needed || Accurate typing || Able to sit at a screen for most of the day || A typing certificate || Experience of a spreadsheet || No formal qualification is required. The fourteen-week end date is fixed.
Senior administrator || Hounslow Civic Rooms || administration || Hounslow || experienced || full-time || permanent || on-site || year:32100 || days || Lead the admin team of four for a fictional community trust, covering diaries, budgets and cover when someone is off. || Allocate the day's work and check it is finished || Prepare the monthly spend sheet for the director || Recruit a temp when a colleague is off for more than a week || At least three years of office experience, including supervising someone || Confident with spreadsheets and a shared inbox || Able to give a clear handover || A management qualification || Experience of charity or council administration || A qualification is welcome. The three years of experience, including supervision, matter more.
Workshop administrator || Acton Bench Co || administration || Acton || entry || full-time || permanent || on-site || year:24600 || earlies || Raise job cards and order fixings for a fictional joinery workshop. You work beside the shop floor, not in a quiet corporate office. || Write job cards from the supervisor's list || Book couriers for finished pieces || Keep the dust out of the paperwork || No previous paid employment is needed || Comfortable in a noisy workshop || Able to use email || Any practical or shop experience || A joinery qualification, which is not required || No formal qualification is required. You will not be asked to use the machines.
Library administrator || Ealing Shelf Trust || administration || Ealing || some || part-time || permanent || on-site || hour:13.40 || mornings || Process membership forms and reservation emails for a fictional community library. || Add new members to the register || Send reservation emails when a book comes back || Count the cash drawer with a colleague || Six months of office, shop or library experience || Confident with email || Happy to explain a simple rule kindly || A library qualification || Another language || No library qualification is required for this administrator post.
Medical secretary || Hammersmith Letter Clinic || administration || Hammersmith || some || full-time || permanent || hybrid || year:29200 || hybrid || Type clinic letters from dictated notes for a fictional private practice. A doctor signs every letter before it is sent. || Type letters and return them for signature the same day || Book follow-up appointments the letter asks for || Keep the dictation queue in date order || At least one year of audio typing or medical administration || A high standard of spelling || Discreet with health information || A medical terminology course || Audio typing at 60 words a minute || An AMSPAR or equivalent certificate is desirable, not essential, if the year of audio typing is in place.
Contracts assistant || Southall Paper Bond || administration || Southall || experienced || full-time || permanent || on-site || year:30500 || days || Check supplier contracts for missing dates and insurance dates for a fictional facilities firm. You do not negotiate the commercial terms. || Log each contract and its end date || Chase missing insurance certificates || Tell the contracts manager two months before a renewal || At least two years in administration, procurement or finance support || Able to read a date and a notice period carefully || Happy to ask when a clause is unclear || A CIPS qualification || Experience of a contract register || No CIPS qualification is required.
Parish administrator || Greenford St Helen Office || administration || Greenford || entry || part-time || fixed-term || on-site || hour:12.90 || mornings || Keep the service register and the hall diary for a fictional parish office on a one-year contract. || Enter baptisms and weddings in the register as the vicar instructs || Take hall bookings and send a receipt || Order candles and paper when stocks are low || No previous paid employment is needed || Respectful in a place of worship || Able to write a clear phone message || Any volunteering in a community building || A theology qualification || No formal qualification is required.
Team administrator || Hayes Roster Hub || administration || Hayes || some || full-time || permanent || on-site || year:26800 || days || Build the weekly rota and the meeting pack for a fictional logistics office in Hayes. || Collect leave requests and draft the rota || Print the Monday meeting pack || Book the pool car and record the mileage || At least one year in an office || Careful with dates and names || Able to say no to a request that breaks the rota rules || Experience of a warehouse office || A transport qualification || No formal qualification is required.
Customer service adviser || West Ealing Helpline || customer-service || West Ealing || entry || full-time || permanent || on-site || year:23900 || lates || Answer evening calls about missed deliveries for a fictional parcel company. The depot itself is a different job. || Follow the call script and offer the next delivery day || Record the door number the customer gives you || Pass damaged-parcel claims to the claims desk || No previous call-centre job is required || Clear spoken English || Able to work until 8:00pm || Shop or reception experience || Another language || No formal qualification is required.
Complaints officer || Acton Call Ledger || customer-service || Acton || experienced || full-time || permanent || hybrid || year:33400 || hybrid || Investigate written complaints for a fictional utility broker and write the reply a manager must approve. || Read the account history before you reply || Draft a reply that states what will happen next || Call the customer when the letter would be too slow || At least two years in customer service, including complaint handling || Able to stay calm in writing || Confident deciding when to refund within a set limit || A professional complaint-handling certificate || Experience of an energy or water account || No formal qualification is required if the two years include complaints.
Call centre agent || Hounslow Night Desk || customer-service || Hounslow || entry || full-time || permanent || on-site || hour:13.60 || nights || Night calls for a fictional roadside-assistance brand. You log the breakdown and pass the location to a patrol controller. || Take the registration, the location and a phone number || Stay on the line until the controller accepts the job || Flag any caller who sounds unsafe || No previous night-work job is required || Comfortable staying awake on nights || Clear spoken English || A driving licence, which is not needed because you do not drive || First aid || No formal qualification is required. A driving licence is not required.
Customer support assistant || Wembley Ticket Window || customer-service || Wembley || entry || part-time || temporary || on-site || hour:12.70 || weekends || Answer questions about a fictional weekend market: where to queue, what time it closes, and lost property. The role ends after the winter season. || Reply to email and the market's web form || Log lost property and who collected it || Tell a supervisor about a safety worry || No previous paid employment is needed || Friendly and clear || Able to work Saturdays and Sundays through the winter || Shop experience || Another language || No formal qualification is required.
Service adviser || Hammersmith Bike Counter || customer-service || Hammersmith || some || full-time || permanent || on-site || year:25200 || days || Book repairs and explain waiting times at a fictional cycle workshop. The mechanics do the repairs. || Book jobs into the workshop diary || Call customers when a bike is ready || Take payment for the work the mechanic has listed || At least six months with customers, in a shop or on a phone || Able to explain a delay without blaming a colleague || Basic computer use || A cycle mechanic qualification, which is not required || Knowledge of local cycle routes || No mechanic qualification is required.
Contact centre coach || Southall Voice Floor || customer-service || Southall || experienced || full-time || permanent || on-site || year:31800 || days || Listen to calls and coach a team of eight advisers for a fictional insurance claims line. You still take calls when the queue is long. || Review three calls a week with each adviser || Update the call guide when a rule changes || Take overflow calls after 4:00pm || At least two years on the phones and some experience of helping new starters || Able to give feedback that is specific || Patient when someone is learning || A training qualification || Experience of insurance claims || No training qualification is required.
Customer service apprentice || Greenford Help Apprentices || customer-service || Greenford || entry || full-time || fixed-term || on-site || year:15500 || days || A customer-service apprenticeship on a fictional helpline. You answer simple calls and spend one day a week in training. || Answer calls that are on the new-starter script || Log the result in the practice system || Attend the training day and complete the set work || No previous paid employment is needed || Willing to study during the apprenticeship || Clear spoken English || Shop or volunteer experience with the public || A customer-service certificate already held || English and maths are studied as part of the apprenticeship if you do not already have them.
Returns adviser || Feltham Parcel Desk || customer-service || Feltham || entry || part-time || permanent || on-site || hour:12.55 || mornings || Process returns at a fictional parcel shop counter. You scan the label and print the receipt. You do not decide refunds over twenty pounds. || Scan returned parcels and give the receipt || Explain the next step from the card on the counter || Call a supervisor for a refund above the limit || No previous paid employment is needed || Comfortable handling parcels up to 10kg || Polite when someone is disappointed || Shop experience || A driving licence || No formal qualification is required.
Live chat adviser || Richmond Screen Support || customer-service || Richmond || some || full-time || permanent || remote || year:26000 || hybrid || Reply to live chat about a fictional furniture retailer's orders. You work from home after two weeks in Richmond. The employer provides the laptop. || Answer chats within the set time || Track an order and give the date on the screen || Send the chat to a specialist when the item is damaged || At least one year of customer service by phone, email or chat || Fast, clear written English || A quiet place to work and a reliable internet connection || Experience of a retail system || A furniture qualification || No formal qualification is required. Home working starts only after the Richmond training weeks.
Complaints administrator || Slough Case Tray || customer-service || Slough || some || full-time || permanent || on-site || year:27100 || days || Log complaints and chase the team that owes a reply for a fictional housing association. You do not decide the outcome. || Register each complaint the day it arrives || Send reminders when a reply is late || Prepare a weekly count for the manager || At least one year of admin or customer service || Organised and discreet || Able to write a neutral summary || Housing experience || A housing qualification || No formal qualification is required.
Member support adviser || Brighton Pier Club || customer-service || Brighton || entry || part-time || permanent || on-site || hour:12.45 || weekends || Help new members of a fictional leisure club fill in the joining form and explain the timetable. || Check the form is complete || Show someone how to book a class on the screen || Take lost-card reports || No previous paid employment is needed || Friendly || Basic computer use || Leisure or gym experience || A fitness qualification, which belongs to the instructor job || No fitness qualification is required.
Retail assistant || Ealing Market Baskets || retail || Ealing || entry || part-time || permanent || on-site || hour:12.40 || weekends || Serve on the till and refill the bakery table in a fictional indoor market. Saturday is essential. || Serve customers and give the right change || Refill bread and note what sold out || Sweep your section at the end of the shift || No previous shop job is required || Honest with money || Able to stand for a four-hour shift || Any customer experience || A food hygiene certificate || No formal qualification is required. Saturday working is essential.
Sales adviser || West Ealing Phone Hut || retail || West Ealing || some || full-time || permanent || on-site || year:24000 || days || Explain handsets and tariffs in a fictional phone shop. You must not invent a discount that is not on the list. || Greet people and find out what they need the phone to do || Complete the sale on the till using only approved tariffs || Keep the display charged and labelled || At least six months in any shop || Comfortable with a till || Honest about what a tariff includes || Experience of phone sales || A sales qualification || No formal qualification is required.
Stock assistant || Acton Cloth Room || retail || Acton || entry || part-time || temporary || on-site || hour:12.30 || earlies || Unpack clothing deliveries before the fictional shop opens, for the six weeks before Christmas. || Unpack cartons and hang garments in size order || Attach security tags || Tell a supervisor about damaged items || No previous shop job is required || Able to start at 7:00am || Careful with small tags || Any warehouse or shop experience || A fashion qualification || No formal qualification is required. The job ends on 24 December.
Retail supervisor || Hanwell Corner Store || retail || Hanwell || experienced || full-time || permanent || on-site || year:28600 || days || Supervise four retail assistants in a fictional convenience store, including the key and the cash office. || Open or close the shop on your rota days || Check deliveries against the invoice || Coach new till staff || At least two years in retail, including time holding keys || Able to complete a cash declaration || Fair when you correct a colleague || A personal licence for alcohol || A first-aid certificate || A personal licence is desirable because the store sells alcohol, and the employer will discuss training if you do not have one yet.
Visual merchandiser || Wembley Display Loft || retail || Wembley || some || full-time || permanent || on-site || year:27000 || days || Plan window displays for a fictional homeware shop from the photos the head office sends. You also serve when the shop is busy. || Build displays from the plan and the stock you actually have || Print price tickets and check they match the till || Help on the till at weekends || At least one year in a shop || An eye for a tidy display || Able to use a ladder safely for low windows || A visual merchandising course || Experience of a large chain || No formal qualification is required. You will be shown how to use the ladder.
Garden centre assistant || Hounslow Pot Rows || retail || Hounslow || entry || part-time || permanent || on-site || hour:12.25 || weekends || Water plants, load trolleys and serve at an outdoor till in a fictional garden centre. || Water the beds on the list || Help customers lift compost into cars || Cover the outdoor till || No previous garden-centre job is required || Happy to work outside || Able to lift 15kg with a trolley || Plant knowledge || A horticulture qualification || No formal qualification is required.
Butcher's assistant || Southall Counter Meats || retail || Southall || entry || full-time || permanent || on-site || hour:12.90 || earlies || Serve at the counter, clean down and learn basic prep in a fictional butcher's shop. A trained butcher does the skilled cutting. || Serve customers and wrap orders || Clean the counter to the hygiene sheet || Label prices the butcher has set || No previous butchery job is required || Comfortable handling raw meat || Able to follow a hygiene rule || Any food-counter experience || A butchery apprenticeship already completed || No butchery qualification is required to start. Hygiene training is given before you serve.
Pharmacy counter assistant || Hammersmith Dose Counter || retail || Hammersmith || some || part-time || permanent || on-site || hour:13.20 || mornings || Serve the retail side of a fictional pharmacy: cough medicines, appointments for the pharmacist, and prescriptions ready for collection. You do not give clinical advice. || Hand out completed prescriptions after the pharmacist has checked the name || Refer health questions to the pharmacist || Keep the retail shelves tidy || At least six months of shop experience || Discreet || Able to ask for a name and address clearly || A GPhC pharmacy technician qualification || Experience in a pharmacy || A technician qualification is not required. You must not advise on medicines.
Department supervisor || Brentford Home Floor || retail || Brentford || experienced || full-time || permanent || on-site || year:30000 || weekends || Run the homeware floor of a fictional department store on the days you are on duty, including staff breaks and refunds up to a set limit. || Brief the team at the start of the day || Approve refunds within the limit on the card || Walk the floor and fix missing prices || At least three years in retail, with at least one year as a supervisor || Confident with a refund process || Able to work Saturdays || A management NVQ || Experience of furniture sales || No management NVQ is required if you have supervised a shop floor for a year.
Market trader assistant || Leeds Kirkgate Stall || retail || Leeds || entry || full-time || temporary || on-site || hour:12.35 || earlies || Help on a fictional fruit stall in Leeds for the summer. This is full-time early work, not the part-time retail assistant role at the market hall. || Set out fruit before the market opens || Serve and weigh goods || Pack down and count the float || No previous market job is required || Honest with cash || Able to start at 6:30am || Any shop experience || A driving licence || No formal qualification is required.
Sales assistant || Manchester Thread Counter || retail || Manchester || entry || part-time || permanent || on-site || hour:12.21 || lates || Evening cover in a fictional fabric shop. You cut cloth to the length on the ticket and take payment. || Measure and cut fabric || Serve the till || Re-roll cloth that has been left out || No previous shop job is required || Careful measuring || Able to work two evenings and Saturday || Sewing skills || A textiles qualification || No formal qualification is required.
Online order picker || Birmingham Store Back || retail || Birmingham || entry || full-time || permanent || on-site || hour:12.70 || earlies || Pick online grocery orders inside a fictional supermarket. You do not drive the delivery van. || Pick from the list on the handset || Substitute only the items the list allows || Keep chilled food cold || No previous picking job is required || Able to push a heavy trolley || Accurate || A driving licence, which is a different vacancy || First aid || No formal qualification is required. A driving licence is not needed.
Warehouse team member || Acton Cage Store || warehouse || Acton || entry || full-time || permanent || on-site || hour:13.25 || earlies || Load outbound cages for a fictional high-street retailer. Training on the pallet truck takes place in week one. || Build cages so they are stable || Scan each carton as it goes on || Clear cardboard for the baler || No previous warehouse job is required || Able to work in a cold loading bay || Reliable timekeeping || A forklift licence || Any shop stockroom experience || No formal qualification is required.
Reach-truck operator || Greenford Rack Hall || warehouse || Greenford || some || full-time || permanent || on-site || hour:15.40 || nights || Put pallets away in narrow aisle racking on nights. A current reach-truck certificate is essential. || Complete the truck check before the first lift || Put stock in the location on the screen || Report damaged racking and do not use it || A current reach-truck certificate || Comfortable working nights || Able to read a location code || A counterbalance licence as well || Warehouse supervision || The reach-truck certificate is required. Night working is required.
Goods-in clerk || Wembley Inbound Desk || warehouse || Wembley || some || full-time || permanent || on-site || year:26400 || days || Check deliveries against purchase orders in a fictional warehouse office that opens onto the yard. || Book in deliveries on the system || Quarantine items that do not match the order || File delivery notes for the month || At least one year in a warehouse or a stock office || Careful with quantities || Able to query a driver politely || A forklift licence || An inventory qualification || No formal qualification is required.
Inventory assistant || Southall Count Team || warehouse || Southall || entry || full-time || temporary || on-site || hour:13.00 || days || A four-week stock count in a fictional cash-and-carry. You count each bay and write the quantity on the sheet. || Count bays in pairs || Write the quantity on the sheet || Recount when the two counts disagree || No previous stock-count job is required || Honest and careful with numbers || Able to use a ladder for low shelves with a colleague footing it || A forklift licence || Retail experience || No formal qualification is required.
Despatch supervisor || Hounslow Lane Office || warehouse || Hounslow || experienced || full-time || permanent || on-site || year:31200 || earlies || Run the morning despatch lane and the six people on it. You still step in to clear a blocked dock. || Allocate the lane at the start of the shift || Check the last trailer leaves on time || Record accidents and near misses || At least two years leading a warehouse team || Confident with a warehouse system || Calm when a trailer is late || An IOSH or equivalent safety certificate || A forklift licence || A safety certificate is desirable. The two years of team leading are essential.
Returns processor || Brentford Open Box || warehouse || Brentford || entry || part-time || permanent || on-site || hour:12.80 || mornings || Inspect returned homeware and decide, from a chart, whether it can be resold. || Open returns and check them against the chart || Put resale stock back into a cage || Quarantine anything electrical that looks damaged || No previous returns job is required || Able to follow a written chart || Careful with broken items || Any warehouse experience || An electrical qualification || No electrical qualification is required. Damaged electrical items are quarantined, not repaired.
Yard marshal || Feltham Trailer Gate || warehouse || Feltham || some || full-time || permanent || on-site || hour:14.10 || earlies || Direct trailers in a fictional yard and check trailer numbers against the book. You do not drive the artics. || Meet the driver and record the trailer number || Keep pedestrians out of the reversing area || Radio the warehouse when a bay is free || At least one year in a yard, warehouse or security gate || Confident using a radio || Willing to work in bad weather || An HGV licence || A banksman certificate || An HGV licence is not required. A banksman course is provided in the first month if you do not have one.
Cold-store operative || Hayes Chill Rooms || warehouse || Hayes || entry || full-time || permanent || on-site || hour:13.80 || earlies || Pick chilled food in a cold chamber. The employer provides the jacket. Breaks are taken in a warm room. || Pick to the chilled list || Keep the chamber door closed || Tell a supervisor if a temperature alarm sounds || No previous cold-store job is required || Comfortable working in the cold for most of the shift || Able to follow a hygiene rule || A forklift licence || Food production experience || No formal qualification is required.
Warehouse apprentice || Slough Store Apprentices || warehouse || Slough || entry || full-time || fixed-term || on-site || year:16200 || earlies || A warehouse-operative apprenticeship. You learn scanning, wrapping and the safety rules, with a college day each week. || Pick training orders with your coach || Complete the college work || Report hazards on the sheet || No previous paid employment is needed || Willing to study as part of the job || Able to stand for a shift || Any Saturday job || A forklift licence already held || English and maths support is included if you need it. A forklift licence is not required to start.
Van driver || Ealing Round B || driving || Ealing || some || full-time || permanent || on-site || hour:14.00 || earlies || Deliver bakery orders to fictional cafes in Ealing and Hanwell in a refrigerated van the employer owns. || Load trays in drop order || Take a signature or a photo as the device asks || Report a missed cafe before you leave the area || A full UK car driving licence || Able to start at 5:30am || Careful with food still in date || Knowledge of Ealing back streets || A food hygiene certificate || A driving licence is essential. The 5:30am start is essential.
Courier || Acton Cycle Drops || driving || Acton || entry || part-time || permanent || on-site || hour:13.00 || lates || Deliver documents by bicycle around Acton and Ealing. A bike is available if you do not own one. This is not a car job. || Collect the afternoon run from the office || Deliver by 6:00pm and get a signature || Text the coordinator if you cannot find the door || No previous courier job is required || Confident cycling in traffic || A bike is useful but one can be provided || A driving licence, which is not used || Knowledge of local cycle routes || No driving licence is required. You do need to be safe on a bike in traffic.
Passenger assistant || Hounslow School Run || driving || Hounslow || entry || part-time || permanent || on-site || hour:12.70 || term || Ride on a fictional school minibus, help pupils with seatbelts and sit with them. You do not drive. || Check seatbelts before the bus moves || Help pupils on and off at the right stop || Tell the driver if a pupil is missing || No previous passenger-assistant job is required || Patient with children || Able to work term-time mornings and afternoons, with a gap in the middle || A driving licence || A first-aid certificate || No driving licence is required. A DBS check would be started only after a real employer offered a job. This practice form does not ask you to upload one.
HGV class 2 driver || Greenford Trunk Gate || driving || Greenford || experienced || full-time || permanent || on-site || year:36000 || earlies || Drive a rigid lorry between the Greenford warehouse and two fictional stores. Nights are rare and are paid when they happen. || Complete the daily vehicle check || Deliver to the time window || Record defects and do not move an unsafe vehicle || A current C licence and Driver CPC || At least one year driving a rigid lorry || Willing to share a cab on the days a mate is assigned || An articulated licence || ADR || A C licence and Driver CPC are required. An articulated licence is not.
Minibus driver || Wembley Club Route || driving || Wembley || some || part-time || permanent || on-site || hour:13.50 || mornings || Drive a fictional community minibus on a set route to a day centre. The route does not change without notice. || Complete the walkaround check || Keep to the published stops || Record mileage and any incident || A full car licence held for two years and a D1 entitlement || Happy to help passengers with a light bag || Patient in traffic || A MiDAS certificate || Experience of community transport || D1 entitlement is essential. The employer will pay for MiDAS if you do not have it.
Driver's mate || Southall Furniture Ride || driving || Southall || entry || full-time || permanent || on-site || hour:12.90 || days || Help a driver deliver sofas. You do not need a driving licence. You do need to lift with a colleague and use the stair straps. || Load the van in drop order || Carry items using the straps and a second person || Take the customer's name on the device || No driving licence is required || Able to lift and carry with a colleague || Polite inside someone's home || A driving licence for later progression || Furniture experience || No driving licence is required for the mate role.
Taxi office controller || Hammersmith Cab Desk || driving || Hammersmith || some || full-time || permanent || on-site || year:26600 || nights || Dispatch fictional local cabs from a night desk. You do not drive. You must stay calm when a driver refuses a job. || Assign the nearest car || Log lost property || Tell the manager about a safety concern immediately || At least one year in a call centre, dispatch office or similar || Clear radio manner || Able to work nights || A taxi licence, which is for drivers || Knowledge of west London || A taxi driver's licence is not required for the controller job.
Transport administrator || Brentford Planner Desk || driving || Brentford || some || full-time || permanent || hybrid || year:27800 || hybrid || Plan the next day's van routes for a fictional florist. You rarely travel. Friday is a home day. || Build routes that finish before the shop closes || Book an extra van when the board is full || Record mileage against each round || At least one year in transport or office planning || Confident with a spreadsheet || Able to change a route when a van breaks down || A transport manager CPC || Driving experience || A transport manager CPC is not required.
Motorcycle courier || Reading Fast Notes || driving || Reading || some || full-time || contract || on-site || hour:15.00 || days || Same-day documents for a fictional legal cluster. You use your own bike and they pay a mileage rate on top of the hourly pay. Read that before you apply. || Collect within the time window || Get a signature || Keep the paperwork dry || Your own motorcycle, a full licence and business insurance || Knowledge of Reading || Able to work to a clock || A car licence as well || Knowledge of London, which is a different round || A motorcycle licence, your own bike and insurance are essential. The hourly rate does not include the bike.
Workshop porter || Bristol Coach Yard || driving || Bristol || entry || full-time || permanent || on-site || hour:12.60 || earlies || Move coaches inside a fictional yard for cleaning and fuel. A shunter licence is trained. You do not take coaches on the road. || Fuel coaches and record the litres || Drive them inside the yard after training || Report defects on the sheet || No previous coach job is required || Willing to train for a yard shunter permit || Careful around moving vehicles || A PCV licence || A driving licence already held || No PCV licence is required. Road driving is not part of the job.
Hotel receptionist || Ealing Station Hotel || hospitality || Ealing || some || full-time || permanent || on-site || year:25200 || four || Check guests in and out at a fictional 40-room hotel. The four-on, four-off pattern includes nights. || Check guests in and explain breakfast || Take card payments || Hand the night list to the duty manager || At least one year on a reception or front desk || Confident with a booking system after training || Calm when a room is not ready || A hospitality qualification || Another language || No formal qualification is required. Night shifts are part of the rota.
Breakfast assistant || West Ealing Morning Table || hospitality || West Ealing || entry || part-time || permanent || on-site || hour:12.21 || earlies || Lay and clear a fictional hotel breakfast. You start at 6:30am and finish before lunch. || Lay tables from the photo card || Serve tea and clear plates || Tell the chef when a tray is empty || No previous hotel job is required || Able to start at 6:30am || Friendly || A food hygiene certificate || Silver-service experience || No formal qualification is required. The 6:30am start is essential.
Barista || Acton Platform Coffee || hospitality || Acton || entry || part-time || permanent || on-site || hour:12.50 || mornings || Make coffee and serve pastries in a fictional station kiosk. The menu is short and you will be trained on the machine. || Make the drinks on the menu || Keep the counter clean during the rush || Count the till with a supervisor || No previous barista job is required || Able to stand in a small kiosk || Friendly || A coffee qualification || Food hygiene level 2 already held || No formal qualification is required.
Waiting staff || Hanwell Sunday Room || hospitality || Hanwell || entry || part-time || permanent || on-site || hour:12.21 || weekends || Serve Sunday lunch in a fictional pub dining room. You carry plates and take payment at the table on a handheld. || Take food and drink orders || Serve plates and clear them || Report allergens to the chef using the card, and do not guess || No previous waiting job is required || Able to carry three plates with training || Happy to work Sundays || A personal licence || Fine-dining experience || No personal licence is required for this floor role.
Pub supervisor || Greenford Tap Room || hospitality || Greenford || experienced || full-time || permanent || on-site || year:29500 || lates || Supervise evening service in a fictional pub, including the cellar check and the team of four. || Brief the team and allocate sections || Authorise voids on the till || Lock up on the nights you are the duty manager || At least two years in a pub, including time as a supervisor || A personal licence || Able to close the building safely || A cellar qualification || Experience of a kitchen as well as a bar || A personal licence is essential.
Catering assistant || Wembley Event Pantry || hospitality || Wembley || entry || full-time || temporary || on-site || hour:12.60 || days || Wash up and restock a fictional conference centre during a ten-week exhibition season. || Run the dishwasher || Refill water stations || Keep the still room stocked || No previous catering job is required || Able to work the ten-week season, including some Sundays || Comfortable on your feet || A food hygiene certificate || Event experience || No formal qualification is required. The job ends when the season ends.
Housekeeping assistant || Hounslow Stay House || hospitality || Hounslow || entry || full-time || permanent || on-site || hour:12.35 || earlies || Clean guest rooms in a fictional guesthouse. You work from a checklist and a supervisor checks two rooms a day. || Strip and remake beds || Clean bathrooms to the card || Report damage and lost property || No previous housekeeping job is required || Thorough || Able to push a trolley || A cleaning qualification || Hotel experience || No formal qualification is required.
Commis chef || Southall Spice Pass || hospitality || Southall || some || full-time || permanent || on-site || year:25000 || lates || Prep and support the chef in a fictional restaurant. You are not running a section yet. Evenings and Sundays are required. || Prep vegetables and sauces for the evening list || Keep your bench to the hygiene standard || Help plate during service || At least one year in a kitchen || A Level 2 food hygiene certificate || Able to work evenings || A culinary diploma || Tandoor experience || A Level 2 food hygiene certificate is required. A diploma is not.
Hotel night porter || Hammersmith Quiet Keys || hospitality || Hammersmith || some || full-time || permanent || on-site || year:24800 || nights || Cover the fictional hotel reception overnight, set breakfast tables and respond to guest calls. A manager sleeps on site. || Check in late arrivals || Set the breakfast room || Call the manager for anything you are not trained to handle || At least six months in a hotel or security reception || Comfortable working nights alone at the desk || Honest with keys || A first-aid certificate || A personal licence || No personal licence is required. The night manager is on site but asleep unless you call.
Cafe assistant || Brentford Lock Window || hospitality || Brentford || entry || part-time || permanent || on-site || hour:12.30 || weekends || Serve at a fictional canal-side cafe on Fridays and weekends. The cook is in the kitchen. || Take orders and serve them || Make simple hot drinks || Clean tables quickly when the cafe is full || No previous cafe job is required || Friendly || Able to work Friday, Saturday and Sunday || A food hygiene certificate || Till experience || No formal qualification is required. All three weekend days are required.
Domestic assistant || Ealing Ward Broom || cleaning || Ealing || entry || part-time || permanent || on-site || hour:12.70 || mornings || Clean a fictional community clinic before the doors open. Infection-control steps are on the card and you will be shown them. || Damp-dust clinical rooms in the order on the card || Empty clinical waste into the right bin || Sign the cleaning record || No previous clinic cleaning is required || Able to follow an infection-control card || Discreet || A healthcare cleaning certificate || Early-morning experience || No formal qualification is required.
Facilities operative || Acton Block Services || cleaning || Acton || some || full-time || permanent || on-site || year:25500 || days || Cover cleaning, light porterage and meeting-room set-up in a fictional office. It is broader than a single cleaning round. || Clean the floors on the rota || Set rooms for the bookings diary || Move post and water bottles || At least one year in cleaning, porterage or facilities || Able to read a room diary || Physically able to move chairs with a colleague || A cleaning NVQ || A driving licence || No NVQ is required.
School cleaner || Hanwell Classrooms || cleaning || Hanwell || entry || part-time || permanent || on-site || hour:12.50 || evenings || Clean classrooms after the children have left. Term time only, 3:30pm to 6:30pm. || Vacuum and mop the rooms on your round || Lock windows || Report graffiti or damage || No previous cleaning job is required || Able to work after school in term time || Trustworthy with keys || A caretaker qualification || Experience of schools || No formal qualification is required. You are not paid for school holidays.
Window cleaner || Greenford Glass Round || cleaning || Greenford || some || full-time || permanent || on-site || hour:14.00 || days || Clean shopfronts at ground level on a fictional round. Ladders over two steps are not part of this job. || Follow the round sheet || Use the pure-water pole for higher ground-floor glass || Take payment on the card reader || At least one year of cleaning work || A full driving licence || Careful with painted frames || An IPAF licence || Experience of commercial windows || A driving licence is essential. Work above ground-floor pole reach is not part of this role.
Housekeeper || Wembley Let Flats || cleaning || Wembley || experienced || full-time || permanent || on-site || year:27000 || days || Inspect and rota the cleans for a fictional set of 30 short-stay flats. You still clean when a colleague is off. || Check two flats a day against the photo standard || Adjust the rota when a guest leaves early || Order linen || At least two years in housekeeping, including supervising cleans || Able to give clear feedback || A driving licence so you can move between flats || A hospitality degree || Experience of a hotel and of short-stay flats || A driving licence is essential. A degree is not.
Carpet technician || Hounslow Fibre Care || cleaning || Hounslow || some || full-time || permanent || on-site || year:26200 || days || Clean office carpets with a machine you will be trained to use. The van is provided. || Drive the van to the site on the list || Clean the areas on the job sheet || Tell the client what still looks stained and why || A full driving licence || Happy to train on the machine || Polite in an office that is still working || A cleaning qualification || Experience of a similar machine || A driving licence is essential. The machine training is provided.
Relief cleaner || Southall Key Cover || cleaning || Southall || entry || part-time || permanent || on-site || hour:12.80 || days || Cover cleaners who are off sick across three fictional office sites in Southall. The hours can change with a day's notice. || Read the cover sheet the night before || Clean to that site's card || Phone the coordinator if you will be late || No previous cleaning job is required || Able to accept hours that change || Reliable travel between the three sites || A driving licence || A regular round already held || No formal qualification is required. The changing hours are part of the job. Read them before you apply.
Support worker || Acton Bridge House || care || Acton || entry || full-time || permanent || on-site || hour:13.40 || four || Support three adults with learning disabilities in a fictional shared house. You help with meals, activities and personal care as the plan describes. || Follow each person's plan || Write what happened on the shift || Support a community activity such as shopping || No previous care job is required || Respectful and reliable || Able to work the four-on, four-off rota || A Care Certificate already completed || A driving licence || No Care Certificate is required on day one. The practice employer says it will put you through it. A driving licence is not required.
Senior care assistant || Ealing Night Lantern || care || Ealing || experienced || full-time || permanent || on-site || hour:15.10 || nights || Lead the night team of three in a fictional care home. You give medication that the night policy allows a senior to give. || Hand over to the day nurse || Give the medication on the night list after competency sign-off || Respond to call bells and emergencies using the policy || At least two years as a care assistant, with medication competency or a willingness to complete it in the first month || Calm at night || Able to write a clear incident note || A nursing qualification || Experience of dementia care || A nursing pin is not required. Two years of care work are required.
Home care worker || Hanwell Visit Rounds || care || Hanwell || some || part-time || permanent || on-site || hour:13.80 || mornings || Visit people at home in Hanwell for washes, breakfast and medication prompts. Travel time between visits is paid in this advert. Read that line. || Provide personal care as the plan states || Prompt medication and record it || Travel on foot or by bus between visits || At least six months of care work || Able to work morning visits including weekends || Discreet in someone's home || A driving licence || A Care Certificate || A driving licence is not required because the round is local. Travel time between visits is paid.
Activities coordinator || Greenford Day Room || care || Greenford || some || part-time || permanent || on-site || hour:13.50 || days || Plan and run daytime activities in a fictional care home. You do not provide personal care. || Plan a weekly activity that matches what residents ask for || Run the session and note who joined || Shop for materials within the small budget || At least one year of work with older people, in care, volunteering that was supervised, or a similar setting || Creative and organised || Able to change a plan if someone is tired || A degree in occupational therapy || A driving licence || An occupational therapy degree is not required. Personal care is not part of this job.
Reablement assistant || Wembley Home First || care || Wembley || some || full-time || permanent || on-site || year:25600 || days || Support people for a few weeks after a hospital stay so they can manage at home. You follow a therapist's plan. || Help with the tasks on the plan and encourage the person to do what they can || Record progress each visit || Report a deterioration the same day || At least one year of care or therapy-support work || Able to follow a written plan || Car driver with a licence, because the visits are spread out || A physiotherapy qualification || Experience of hospital discharge || A driving licence is essential. A physiotherapy qualification is not.
Nursing associate || Hounslow Ward Practice || care || Hounslow || experienced || full-time || permanent || on-site || year:32000 || four || A fictional community hospital ward is recruiting a nursing associate. You work under a registered nurse. || Deliver the care the nurse assigns || Record observations || Escalate the results that the policy lists || A registered nursing associate qualification with the NMC || Able to work the ward rota || Clear record keeping || A registered nurse pin || Experience of community hospitals || Registration as a nursing associate is essential. A registered nurse pin is a different job.
Care coordinator || Hammersmith Visit Board || care || Hammersmith || experienced || full-time || permanent || hybrid || year:30500 || hybrid || Rota home-care visits and cover sickness for a fictional agency. You are office-based and do not deliver care yourself. || Build a rota that covers the commissioned visits || Phone clients when a worker is late || Keep the electronic roster up to date || At least two years in care, including some office or senior time || Confident on the phone || Organised under pressure || A registered manager award || A driving licence || A registered manager award is not required.
Support worker days || Southall Community Flat || care || Southall || entry || part-time || permanent || on-site || hour:13.20 || days || Daytime support in a fictional flat for two people. The sleep-in is a different vacancy and is not included. || Help with lunch and housework skills || Support an appointment by bus || Write the day notes || No previous care job is required || Patient || Able to work weekdays, not nights || A driving licence || A care NVQ || No formal qualification is required. This advert does not include night or sleep-in work.
Mental health support worker || Brentford Quiet Hour || care || Brentford || some || full-time || permanent || on-site || year:27200 || days || Support adults in a fictional recovery house with routines, groups and tenancy skills. Personal care is not the main task. || Run a morning planning group || Support people to cook a meal || Record risk concerns using the house policy || At least one year in mental health, homelessness or a related support setting || Calm and boundaried || Able to follow a risk policy || A nursing or social-work qualification || A driving licence || A professional clinical qualification is not required. The year of relevant support work is required.
IT support apprentice || Ealing First Desk || it || Ealing || entry || full-time || fixed-term || on-site || year:15800 || days || An IT support apprenticeship. You reset passwords, set up printers and attend college one day a week. || Reset passwords using the checklist || Set up a printer with your coach || Log every job || No previous paid IT job is required || Comfortable using a computer for a full day || Willing to study || A Level 2 IT qualification already held || A home PC you have built || No IT qualification is required to start the apprenticeship.
Junior IT technician || Acton School Screens || it || Acton || some || full-time || permanent || on-site || year:27500 || days || Support the laptops and classroom screens in a fictional secondary school. Term time plus ten inset or holiday days. || Close tickets from staff || Set up a classroom before an exam || Keep a small stock of loan laptops || A Level 2 IT qualification, or one year of paid IT support || Able to explain a fix to a teacher who is in a hurry || Happy to walk the school site || A degree || Experience of a school network || A Level 2 IT qualification or one year of paid support is essential. A degree is not. The holiday working is limited to ten days.
Service desk analyst || Wembley Queue One || it || Wembley || some || full-time || permanent || on-site || year:29000 || earlies || First-line queue for a fictional law firm. You start at 7:30am so the desks work before the solicitors arrive. || Answer the early queue || Set up new starters from a checklist || Escalate anything that needs an administrator password you do not hold || At least one year on a service desk || Punctual for a 7:30am start || Clear written tickets || An ITIL qualification || Experience of a legal firm || No ITIL qualification is required. The 7:30am start is required.
Cyber awareness trainer || Hammersmith Phish Drill || it || Hammersmith || experienced || full-time || permanent || hybrid || year:38000 || hybrid || Run short staff sessions on passwords and suspicious email for a fictional retailer. You also report the numbers. This is training, not a hacking role. || Deliver the 30-minute session || Update the slide deck when a policy changes || Report who has completed it || At least two years in IT support or training || Comfortable speaking to a room of twenty || Able to explain without jargon || A security certification such as Security+ || A teaching qualification || A security certification is desirable. Two years of IT support or training are essential.
Desktop publisher || Southall Layout Bench || it || Southall || some || part-time || permanent || hybrid || hour:16.00 || days || Lay out a fictional community newsletter from the editor's copy. You do not write the articles. Three days a week. || Place the text and pictures in the template || Export a PDF for the printer || Correct layout errors the editor marks || At least one year of layout work, paid or a substantial voluntary publication || Careful with names || Able to meet a Thursday deadline || A journalism qualification || Experience of InDesign or similar || No journalism qualification is required. Layout experience is required.
Data analyst || Hounslow Sheet Room || it || Hounslow || experienced || full-time || permanent || hybrid || year:36000 || hybrid || Build weekly operations reports for a fictional logistics firm from spreadsheets and a simple dashboard. || Refresh the weekly report || Explain a spike in plain English || Check the figures before they go to managers || At least two years of work that included regular reporting in spreadsheets or a dashboard || Careful with numbers || Able to say when the data is not good enough || A degree in data science || SQL || A degree is not required. SQL is desirable. Two years of real reporting are essential.
Web content assistant || Brentford Page Desk || it || Brentford || entry || full-time || permanent || on-site || year:24800 || days || Update opening times and staff names on a fictional charity website. A developer handles anything the editor cannot click. || Change text in the website editor || Check links still work || Ask the developer when a page needs a new feature || No previous web job is required || Careful proofreading || Happy to learn the editor || HTML || A writing sample from college or volunteering || No HTML is required. Training is given on the editor.
Field technician || Hayes Router Visits || it || Hayes || some || full-time || permanent || on-site || year:30000 || days || Visit small fictional offices to swap routers and phone handsets. A van is provided. || Arrive in the window you were given || Swap the kit using the job card || Take the old kit back to stores || At least one year of hands-on IT or telecoms work || A full driving licence || Polite when a customer is still working || A Cisco certification || Experience of cabling || A driving licence and a year of hands-on work are essential. A Cisco certification is not.
QA tester || Reading Bug Notes || it || Reading || some || full-time || contract || hybrid || year:33000 || hybrid || Test a fictional library app before each monthly release and write clear bug notes. A six-month contract. || Follow the test script || Write bugs that a developer can reproduce || Retest the fixes || At least one year of software testing or a year of very detailed admin checking digital systems || Patient and precise || Able to say when something is not ready || An ISTQB certificate || Coding experience || An ISTQB certificate is desirable. A year of testing or equivalent detailed digital checking is essential.
Accounts payable clerk || Ealing Invoice Hatch || finance || Ealing || some || full-time || permanent || on-site || year:28500 || days || Match supplier invoices to purchase orders for a fictional housing charity. You pay only what the budget holder has approved. || Match invoices to orders || Prepare the weekly payment run for approval || Answer supplier calls about a missing payment || At least one year of accounts payable or a similar finance admin role || Accurate || Able to explain a delay || AAT Level 2 || An accounts package used in housing || AAT Level 2 is desirable. The year of payables or finance admin is essential.
Payroll officer || Acton Pay Day || finance || Acton || experienced || full-time || permanent || on-site || year:34500 || days || Run monthly payroll for 80 fictional staff. You do not give personal tax advice. || Process starters, leavers and overtime from approved forms || Check the exception report before the manager approves || Answer pay questions from a script and pass the rest to the manager || At least two years of payroll processing || Discreet || Confident with a payroll system after a handover || A CIPP qualification || Experience of the same payroll software || A CIPP qualification is desirable. Two years of processing payroll are essential.
Finance apprentice || Hammersmith Ledger Start || finance || Hammersmith || entry || full-time || fixed-term || on-site || year:16500 || days || An assistant-accountant apprenticeship. You file invoices and study AAT. You do not authorise payments. || Scan and code invoices for a reviewer || Reconcile a petty-cash tin with your coach || Attend college || No previous accounts job is required || Careful with numbers || Willing to study AAT || AAT Level 2 already completed || A maths A level || AAT study is part of the apprenticeship. You do not need AAT Level 2 to start.
Credit controller || Wembley Balance Call || finance || Wembley || some || full-time || permanent || on-site || year:29200 || days || Phone fictional trade customers about overdue invoices and agree a date. You follow a script and a manager approves write-offs. || Call accounts on the overdue list || Note the promise date || Pass disputes to the right department || At least one year in credit control or collections || Polite and persistent || Clear notes || A legal qualification || Another language || No legal qualification is required.
Management accountant || Hounslow Month End || finance || Hounslow || experienced || full-time || permanent || hybrid || year:42000 || hybrid || Produce the monthly management accounts for a fictional manufacturer and explain the variances. || Close the month with the ledger team || Write a one-page variance note || Answer questions from department heads || A part-qualified or qualified accountant, such as AAT Level 4, CIMA, ACCA or ACA || At least three years in a finance team || Able to explain numbers to non-finance managers || A full ACA qualification specifically || Manufacturing experience || A part-qualified or qualified accountancy credential is essential.
Purchase ledger assistant || Southall Bill Match || finance || Southall || entry || full-time || permanent || on-site || year:24600 || days || Enter supplier bills for a fictional wholesaler. A senior checks the payment run. Training is five days. || Enter bills from the scan || Attach the delivery note || Ask when the supplier name does not match || No previous accounts job is required || Accurate typing of numbers || Happy to ask || AAT Level 2 || Experience of a busy office || No AAT is required. Five days of training are given.
Cashier || Brentford Tickets and Till || finance || Brentford || entry || part-time || permanent || on-site || hour:12.60 || weekends || Sell tickets and balance a till in a fictional leisure centre. You report a shortage. You do not investigate it. || Sell tickets on the till || Balance the drawer at the end of the shift || Report a difference the same day || No previous cashier job is required || Honest || Comfortable handling cash || A finance qualification || Leisure experience || No formal qualification is required.
Billing clerk || Slough Meter Post || finance || Slough || some || full-time || permanent || on-site || year:26800 || days || Send fictional energy bills and correct address errors. This is not Westford Energy and the accounts are invented for practice. || Print the bill run and spot the exceptions list || Correct addresses from the approved form || Answer phone queries about what a line on the bill means, using the guide || At least one year of billing or customer admin || Able to read a bill || Patient on the phone || An energy-industry qualification || Experience of a similar billing system || No industry qualification is required.
HR adviser || Ealing People Desk || hr || Ealing || experienced || full-time || permanent || hybrid || year:36000 || hybrid || Advise fictional managers on absence and probation, using the charity's policy. You escalate dismissals to the HR manager. || Talk managers through the absence policy || Draft letters for the HR manager to approve || Keep notes of formal meetings || At least three years in HR, including advice to managers || A CIPD Level 5 qualification, or equivalent experience the HR manager can test || Discreet || A law degree || Experience of charities || CIPD Level 5 or equivalent tested experience is essential. You do not decide dismissals alone.
Recruitment coordinator || Acton Shortlist || hr || Acton || some || full-time || permanent || on-site || year:28000 || days || Book interviews and send offer packs for a fictional hospital support-services team. You do not choose the successful candidate. || Write adverts from a manager's checklist || Book panels and greet candidates || Send the offer pack the manager has signed || At least one year in recruitment or HR administration || Organised || Friendly to a nervous candidate || A CIPD qualification || Experience of NHS systems || No CIPD qualification is required.
Learning administrator || Wembley Course Book || hr || Wembley || entry || full-time || permanent || on-site || year:25000 || days || Book training rooms and send joining instructions for a fictional company's courses. You do not teach. || Book rooms and send the joining email || Print registers || Chase evaluation forms || No previous HR job is required || Careful with dates || Confident with email || A training qualification || Reception experience || No formal qualification is required.
HR apprentice || Hammersmith Starter Pack || hr || Hammersmith || entry || full-time || fixed-term || on-site || year:16000 || days || An HR-support apprenticeship. You prepare starter forms and study. You do not see salaries beyond what the form needs. || Prepare starter forms for a reviewer || File leaver checklists || Attend college || No previous HR job is required || Discreet || Willing to study || A CIPD qualification already held || Office experience || CIPD study starts with the apprenticeship. You do not need the qualification yet.
People partner || Hounslow Shift Advice || hr || Hounslow || experienced || full-time || permanent || on-site || year:40000 || days || Support fictional warehouse managers with conduct cases and restructures. This is a senior HR role. || Advise on the conduct policy || Sit in formal meetings || Write the outcome letter for a director to sign || A CIPD Level 5 or above, and at least four years of HR casework || Able to explain a policy in a warehouse office || Calm when a meeting is tense || A legal practising certificate || Experience of logistics || CIPD Level 5 or above and four years of casework are essential. A legal practising certificate is not.
Reward assistant || Southall Pay Bands || hr || Southall || some || full-time || permanent || hybrid || year:31000 || hybrid || Maintain the salary spreadsheet and the job-level list for a fictional retailer. You do not decide anyone's pay. || Update the sheet from approved changes || Check a new role sits in the published band || Prepare a quarterly summary || At least one year in HR or payroll administration || Careful with confidential numbers || Confident with spreadsheets || A reward qualification || AAT || No reward qualification is required.
Staff engagement assistant || Brentford Notice Board || hr || Brentford || entry || part-time || fixed-term || on-site || hour:13.00 || days || Organise a fictional staff survey and the poster campaign for a six-month project. || Send the survey link || Book the canteen for a results session || Collect comments written on the posters || No previous HR job is required || Organised || Friendly || A CIPD qualification || Design skills || No formal qualification is required. The contract is six months.
Onboarding officer || Greenford Badge Office || hr || Greenford || some || full-time || permanent || on-site || year:27600 || days || Run the first-day process for a fictional factory: badges, lockers and the induction room. || Prepare badges from the approved starter list || Meet people on their first morning || Book the health-and-safety induction || At least one year in HR, reception or a factory office || Warm and organised || Able to spot a missing right-to-work check and stop, rather than guess || An immigration-adviser qualification || Experience of a factory induction || No immigration-adviser qualification is required. You follow a checklist. You do not give immigration advice.
Marketing apprentice || Acton Poster Route || marketing || Acton || entry || full-time || fixed-term || on-site || year:15200 || days || An apprenticeship writing short posts and helping at fictional community events. A manager approves every post. || Draft posts from a fact sheet || Help set up a stall || File the photos in the right folder || No previous marketing job is required || Careful spelling || Willing to study || A marketing degree || Social media you already run || A degree is not required. Posts are approved before they go out.
Communications officer || Hanwell Notice Editor || marketing || Hanwell || some || full-time || permanent || hybrid || year:30500 || hybrid || Write the monthly newsletter and the website news for a fictional council-facing charity. This is not a local authority job. || Draft the newsletter from staff notes || Update the news page || Answer a journalist with the lines the director has approved || At least two years of writing for work, a charity or a newsroom || Accurate || Able to keep to an agreed line || A journalism degree || Experience of a council || A degree is not required. Two years of workplace writing are required.
Social media assistant || Wembley Match Day || marketing || Wembley || entry || part-time || temporary || on-site || hour:13.00 || weekends || Post approved photos during fictional weekend tournaments. You do not invent scores. || Post the photos the manager has marked || Reply to simple questions with the answers on the card || Tell a manager about an abusive message and do not argue || No previous social-media job is required || Careful || Able to work Saturdays in the season || A photography qualification || Sports knowledge || No formal qualification is required. You post only what has been approved.
Brand designer || Hammersmith Ink Studio || marketing || Hammersmith || experienced || full-time || permanent || hybrid || year:34000 || hybrid || Design leaflets and simple digital ads for a fictional theatre. You take a brief and show two options. || Design from the brief || Prepare print-ready files || Keep the logo rules || A portfolio of real or college work and at least two years of design work || Able to take feedback || Organised with deadlines || A design degree specifically || Experience of a theatre || A degree is not essential if the portfolio and the two years are strong. The portfolio is essential.
PR assistant || Hounslow Story Desk || marketing || Hounslow || entry || full-time || permanent || on-site || year:25500 || days || Draft local press releases from a manager's notes for a fictional college. You do not speak to journalists alone at first. || Draft the release || Build the contact list || Log who was sent what || No previous PR job is required || Clear writing || Discreet about students || A media degree || Student-paper experience || No formal qualification is required.
Events assistant || Southall Hall Booking || marketing || Southall || some || full-time || permanent || on-site || year:26800 || weekends || Run the practical side of fictional community events: stalls, volunteers and the running order. Some Sundays. || Send the stall plan || Brief volunteers || Pack down and note what broke || At least one year of events or hospitality work || Organised on the day || Able to work some Sundays || A PR qualification || A driving licence || No PR qualification is required. Some Sunday work is required.
Copywriter || Brentford Plain Words || marketing || Brentford || some || part-time || contract || remote || year:28000 || hybrid || Write website pages and letters for a fictional building society three days a week, from home. The pay is a part-time salary, not a day rate. || Write to the brief and the tone guide || Send copy for legal approval where the brief says so || Keep a list of pages still to do || At least two years of writing for customers || Excellent spelling || Able to work without an office || A financial qualification || SEO experience || No financial qualification is required. The salary is for three days, not a full week.
Internal communications assistant || Greenford Shift News || marketing || Greenford || entry || full-time || permanent || on-site || year:24600 || days || Write the weekly note for a fictional factory, from interviews with supervisors. You will be shown how. || Talk to two supervisors a week and write what they agree || Pin the note on the board and the intranet || Collect questions and pass them on || No previous communications job is required || Able to listen and write it down plainly || Comfortable on a factory floor in the PPE provided || A journalism qualification || Experience of shift work || No formal qualification is required.
Door supervisor || Wembley Event Gate || security || Wembley || some || part-time || permanent || on-site || hour:14.50 || weekends || Weekend door work at a fictional events venue. A current SIA door supervisor licence is required. || Check tickets and bags as the brief describes || Refuse entry when the brief says so, and call the manager rather than argue || Write an incident note before you leave || A current SIA door supervisor licence || Able to work Friday and Saturday nights || Calm || A first-aid certificate || Experience of a similar venue || An SIA door supervisor licence is essential.
CCTV operator || Acton Camera Room || security || Acton || some || full-time || permanent || on-site || year:27200 || four || Watch cameras in a fictional shopping centre control room and radio the floor team. You do not patrol. || Watch the cameras and keep a log || Radio concerns using the codes on the card || Hand over the log || An SIA CCTV licence || Able to concentrate for a shift || Clear radio speech || A door supervisor licence as well || Experience of a control room || An SIA CCTV licence is essential. Patrol work is a different role.
Mobile patrol officer || Hounslow Night Keys || security || Hounslow || experienced || full-time || permanent || on-site || year:29000 || nights || Drive between fictional empty sites, check locks and respond to alarms. A car licence and an SIA licence are both required. || Drive the patrol route || Attend alarms and report what you find || Do not enter a building the instruction says to leave for the police || A full driving licence and a current SIA security licence || At least one year of security work || Able to work nights alone || An advanced driving qualification || First aid || A driving licence, an SIA licence and a year of security work are all essential.
Reception security officer || Hammersmith Lobby Watch || security || Hammersmith || entry || full-time || permanent || on-site || hour:13.40 || days || Meet visitors in a fictional office lobby, issue badges and walk the floor once an hour. The employer will sponsor the SIA application if you pass the interview. Read the training line. || Sign visitors in || Walk the hourly route || Call the police or the manager using the card, rather than intervene in a fight || No previous security job is required || Polite and observant || Willing to gain an SIA licence during the paid training month || A current SIA licence already held || A first-aid certificate || No SIA licence is required on day one. Paid training toward the licence is part of this advert. A current licence is desirable, not essential.
Lock-up officer || Southall Unit Doors || security || Southall || some || part-time || permanent || on-site || hour:13.20 || evenings || Lock a fictional industrial estate at 7:00pm and open it at 6:00am on a split. You need an SIA licence. || Lock each unit on the list || Report a unit that will not lock || Open in the morning and note overnight damage || A current SIA security licence || Able to work the early and late split || Reliable || A driving licence || Alarm-response experience || An SIA licence is essential. A driving licence is not, because the estate is one site.
Events steward || Brentford Crowd Edge || security || Brentford || entry || part-time || temporary || on-site || hour:12.90 || weekends || Steward a fictional weekend market. This role does not need an SIA licence because you give directions and do not provide licensed security. The advert says that on purpose. || Direct people using the map || Radio a supervisor if someone needs first aid || Keep an exit clear || No previous stewarding is required || Friendly and firm || Able to stand for a shift || An SIA licence || A first-aid certificate || No SIA licence is required for this steward role. Read the advert so you do not confuse it with the door-supervisor job.
Maintenance electrician || Greenford Fuse Board || maintenance || Greenford || experienced || full-time || permanent || on-site || year:40000 || days || Fault-find and repair electrical systems in a fictional factory. You must be qualified to inspect and test. || Repair faults on the day's list || Inspect and test as the schedule says || Isolate safely and record it || A City and Guilds 2391 or equivalent inspection qualification, and a completed apprenticeship or equivalent experience || Able to isolate and prove dead || Factory or industrial experience || A degree in electrical engineering || 18th Edition wiring regulations || A 2391 or equivalent and a completed electrical apprenticeship, or equivalent experience, are essential.
Painter and decorator || Ealing Stair Wells || maintenance || Ealing || some || full-time || permanent || on-site || year:30000 || days || Repaint communal stairs in fictional housing blocks. Materials are provided. You need a driving licence for the van. || Prepare surfaces || Paint to the specification || Protect floors and leave the site clean || At least two years of painting and decorating || A full driving licence || Able to work neatly in someone's block || An NVQ in decorating || Experience of empty commercial sites only || A driving licence and two years of decorating are essential.
Carpenter || Acton Door Sets || maintenance || Acton || experienced || full-time || permanent || on-site || year:34000 || days || Hang doors and repair frames in fictional void properties. You work from a van. || Survey the door and order the right blank || Fit and adjust the door || Make the property secure before you leave || A recognised carpentry qualification or five years of site carpentry || A full driving licence || Able to specify a door that will actually fit || A bench-joinery background || Experience of fire doors || A carpentry qualification or five years, plus a driving licence, are essential.
Handy person || Hanwell Small Jobs || maintenance || Hanwell || entry || part-time || permanent || on-site || hour:13.50 || days || Minor repairs in a fictional sheltered scheme: curtains, minor leaks, and flat-pack. Gas and electrical certificates are out of scope. || Complete the jobs on the list || Know when to stop and call a qualified contractor || Keep the store cupboard tidy || No trade qualification is required || Practical and polite || Able to explain what you did in a short note || A plumbing ticket || Experience with older residents || No trade ticket is required. Gas and electrical work are not included.
Multi-skilled technician || Wembley Plant Room || maintenance || Wembley || experienced || full-time || permanent || on-site || year:35500 || four || Planned maintenance on fictional office plant: filters, belts and basic controls. A manager covers gas safety. || Complete the planned-maintenance sheet || Change filters and belts you are trained on || Escalate anything outside the sheet || An engineering or building-services apprenticeship, or three years of plant-room work || Able to follow a permit || Careful with lock-off || A gas-safe registration || An electrical inspection qualification || An apprenticeship or three years of plant work are essential. Gas Safe work is not part of your duties.
Groundskeeper || Hounslow Pitch Edge || maintenance || Hounslow || some || full-time || permanent || on-site || year:26200 || earlies || Cut grass and mark a fictional sports pitch. Early starts in summer. || Mow and mark the pitch to the plan || Check the tractor before you use it || Report a hole or broken glass before a match || At least one year of grounds or landscape work || Willing to train on the tractor if you are not already passed out || Able to start early in summer || A chainsaw certificate || A pesticide certificate || Tractor training is provided if needed. A chainsaw certificate is not required.
Maintenance apprentice || Southall Tool Chest || maintenance || Southall || entry || full-time || fixed-term || on-site || year:15000 || earlies || A property-maintenance apprenticeship. You shadow repairs and attend college. You do not work on gas. || Shadow the repairs on the list || Keep the van tidy || Complete college assignments || No previous trade job is required || Practical || Willing to study || A driving licence already held || GCSEs in maths and English || No trade qualification is required to start. Gas work is excluded. English and maths support is available.
Facilities coordinator || Hammersmith Job Sheet || maintenance || Hammersmith || some || full-time || permanent || hybrid || year:29000 || hybrid || Raise job sheets for a fictional office and chase contractors. You do not carry out the repairs. || Log repairs and assign the contractor on the list || Check the work is done before you close the job || Report spend against the monthly budget || At least one year in facilities, reception or administration || Organised || Able to chase politely || A building-services qualification || A driving licence || No technical qualification is required for the coordinator role.
Bricklayer || Greenford Wall Gang || construction || Greenford || experienced || full-time || permanent || on-site || hour:22.00 || earlies || Lay bricks and blocks on a fictional housing site. The rate is the employed hourly rate, not a self-employed price. || Work to the line and the drawing || Keep the gang's area safe || Record materials used || An NVQ in bricklaying or a completed bricklaying apprenticeship || A CSCS card || Able to work outdoors || A driving licence || Supervisory experience || A bricklaying NVQ or completed apprenticeship, and a CSCS card, are essential.
Site administrator || Ealing Cabin Desk || construction || Ealing || some || full-time || permanent || on-site || year:28000 || earlies || Run the site cabin: inductions, deliveries and the signing-in book for a fictional contractor. || Induct visitors using the script || Book deliveries into the gate || File RAMS where the manager shows you || At least one year in administration || Confident on a building site after the induction || Organised || A construction degree || A CSCS card already held || No construction degree is required. A CSCS card can be gained in the first month and is not essential on day one.
Plant operator || Acton Digger Seat || construction || Acton || experienced || full-time || permanent || on-site || hour:20.00 || earlies || Operate a 360 excavator on a fictional road job. Tickets must be in date. || Complete the machine check || Dig to the supervisor's mark || Do not lift people || A current CPCS or NPORS card for a 360 excavator || At least two years operating similar plant || Able to work to a banksman's signals || A dumper ticket as well || A driving licence || A current 360 card and two years of operating are essential.
Construction apprentice || Hanwell Site Start || construction || Hanwell || entry || full-time || fixed-term || on-site || year:15600 || earlies || A construction apprenticeship rotating through a fictional site. College one day a week. You do not operate plant. || Keep the work area tidy || Learn the task the tradesperson sets || Attend college || No previous site job is required || Willing to work outdoors and to study || Able to take an induction seriously || A CSCS card already held || A driving licence || No CSCS card is required before the first college week. The employer arranges it in this practice advert.
Scaffolder || Wembley Access Crew || construction || Wembley || experienced || full-time || permanent || on-site || hour:21.00 || earlies || Erect and alter scaffold on a fictional commercial job with a qualified team. || Follow the supervisor's design || Wear the harness where the method says so || Do not alter a tie without agreement || A CISRS scaffolder card || Comfortable working at height || Able to lift scaffold fittings || An advanced inspection ticket || A driving licence || A CISRS scaffolder card is essential.
General labourer || Hounslow Footings || construction || Hounslow || entry || full-time || temporary || on-site || hour:13.80 || earlies || Dig and barrow on a fictional six-week drainage job. Boots are provided. The job ends with the job. || Barrow spoil to the skip || Keep the public path clear || Use the tools you are shown and no others || No previous site experience is required || Physically prepared for digging || Willing to work in the rain for six weeks || A CSCS card || A driving licence || No CSCS card is required for this short labouring job. The advert says the induction covers the site rules.
Forklift on site || Southall Materials Bay || construction || Southall || some || full-time || permanent || on-site || hour:16.50 || earlies || Move pallets of materials around a fictional site compound. This is a forklift job, not a labouring job. || Check the truck || Put materials where the board says || Keep pedestrians out of the bay || A current forklift certificate and a CSCS card || At least one year using a forklift || Careful in a shared yard || A telehandler ticket || A driving licence || A forklift certificate and a CSCS card are essential.
Civil engineer || Hammersmith Set Out || construction || Hammersmith || experienced || full-time || permanent || hybrid || year:40000 || hybrid || Set out and check levels for a fictional drainage contractor, and write the daily sheet. || Set out from the drawing || Check levels and record them || Raise a concern if the drawing and the ground disagree || A degree or HND in civil engineering, or a completed technician apprenticeship plus five years || Able to use a level || Clear daily records || Chartership || A driving licence || A civil engineering degree, HND or technician apprenticeship plus five years is essential. Chartership is desirable.
Production team leader || Ealing Bottle Line || manufacturing || Ealing || experienced || full-time || permanent || on-site || year:33000 || earlies || Lead eight people on a fictional bottling line. You still cover a station when someone is on a break. || Brief the team and start the line || Stop the line for quality faults || Record output each hour || At least two years in food production, including some team leading || A Level 2 food hygiene certificate || Able to give a short briefing || A degree || A forklift licence || Two years in food production, including team leading, and Level 2 food hygiene are essential.
Sewing machinist || Acton Cloth Line || manufacturing || Acton || some || full-time || permanent || on-site || hour:13.20 || days || Sew cushion covers on a fictional line from a pattern. Speed matters less than straight seams in the first month. || Sew the operation you are shown || Keep to the quality sample || Tell a supervisor if the fabric is flawed || At least six months of machining, in a factory or a serious home business you can describe || Able to follow a sample || Comfortable with repetitive work || A fashion degree || Experience of leather || No degree is required. Six months of machining are required.
Bakery production assistant || Greenford Oven Early || manufacturing || Greenford || entry || full-time || permanent || on-site || hour:13.00 || nights || Mix and tray up bread in a fictional bakery from 8:00pm. The night rate is the rate shown. || Weigh ingredients from the card || Tray up to the photo || Clean down before you leave || No previous bakery job is required || Comfortable with nights and flour dust, with the mask provided || Able to follow a recipe card exactly || A baker's apprenticeship already completed || A driving licence || No apprenticeship is required. Nights are required.
Quality checker || Wembley Gauge Bench || manufacturing || Wembley || some || full-time || permanent || on-site || year:27600 || days || Check machined parts against a drawing for a fictional workshop and quarantine failures. || Measure parts with the tools provided || Record the result || Stop a batch when the chart says so || At least one year in manufacturing or inspection || Careful with numbers and gauges || Able to say that a batch has failed || A metrology qualification || A driving licence || No metrology qualification is required. A year of factory or inspection work is required.
Print-finishing assistant || Hounslow Fold Room || manufacturing || Hounslow || entry || part-time || permanent || on-site || hour:12.70 || days || Fold and pack printed leaflets in a fictional print shop three days a week. || Set the folding machine with a colleague || Pack to the count on the ticket || Recycle spoils in the right bin || No previous print job is required || Able to stand || Careful with counts || A print qualification || Machine experience || No formal qualification is required.
Process operator || Southall Mix Plant || manufacturing || Southall || experienced || full-time || permanent || on-site || year:34500 || four || Operate a fictional mixing plant from a panel, following the batch card. A process safety briefing is compulsory. || Start and stop batches from the card || Take samples for the lab || Respond to alarms using the card and call the shift lead || At least two years as a process operator || Willing to complete the site safety ticket || Able to stay at a panel and still walk the plant || A chemical engineering degree || A forklift licence || Two years as a process operator are essential. A degree is not.
Assembly technician || Brentford Kit Bench || manufacturing || Brentford || entry || full-time || permanent || on-site || hour:13.40 || days || Assemble simple electrical housings from a pictorial card. You do not design them and you do not test mains voltage. || Assemble to the card || Torque the screws with the tool provided || Place failed units in the red tray || No previous assembly job is required || Able to follow a picture card || Good eyesight with glasses if you need them || An electrical qualification || Soldering experience || No electrical qualification is required. Mains testing is done by someone else.
Food production operative || Slough Tray Line || manufacturing || Slough || entry || full-time || temporary || on-site || hour:12.85 || earlies || A three-month contract on a fictional ready-meal line over the winter peak. Hygiene rules are strict. || Add the component on your station || Keep hair fully covered || Stop and tell a leader if a foreign object appears || No previous factory job is required || Willing to follow a strict hygiene rule || Able to work the three months, including the week of Christmas || A food science degree || A forklift licence || No degree is required. The contract includes Christmas week. Read that before you apply.
Teaching assistant || Hanwell Classroom Two || education || Hanwell || some || part-time || permanent || on-site || hour:13.60 || term || Support a fictional year 3 class four days a week in term time. You follow the teacher's plan. || Support the group the teacher names || Prepare the materials on the list || Tell the teacher about a concern the same day || At least six months in a school, nursery or youth setting || Patient || Able to work term time, four days a week || A degree in education || A TA Level 3 qualification || A degree is not required. Six months with children in a supervised setting are required. Term time only.
Cover supervisor || Ealing Hall Duty || education || Ealing || some || full-time || permanent || on-site || year:25000 || term || Supervise classes in a fictional secondary school when a teacher is absent, using the work that has been set. You are not the teacher. || Give out the set work || Keep the room calm || Send a note of what was finished || Experience of working with secondary-age pupils || Confident in front of a class || Able to follow someone else's lesson plan || Qualified teacher status || A degree || Qualified teacher status is not required. This is supervision, not teaching.
Nursery assistant || Acton Small Chairs || education || Acton || entry || full-time || permanent || on-site || year:24000 || days || Support play and care routines in a fictional nursery. A room leader is present. || Set out activities || Help with meals and personal care for the children || Write a short observation || No previous nursery job is required || Warm and reliable || Able to kneel and sit on the floor || A level 3 early years qualification || A driving licence || A level 3 early years qualification is not required for the assistant post. The room leader holds it.
Learning mentor || Wembley Tutor Bay || education || Wembley || some || part-time || fixed-term || on-site || hour:14.00 || term || Mentor six fictional pupils who are behind with reading, for two terms. You use the scheme the school has bought. || Run the reading sessions || Record scores on the sheet || Meet the teacher once a fortnight || At least one year of work with young people || Patient || Able to follow the reading scheme rather than invent a different one || A teaching qualification || Experience of the same scheme || A teaching qualification is not required.
Exam invigilator || Hounslow Sports Hall || education || Hounslow || entry || part-time || temporary || on-site || hour:12.50 || days || Invigilate fictional summer exams. The work is quiet and the rules are strict. You cannot bring a phone into the hall. || Give out papers at the stated minute || Walk the hall || Report a problem to the lead invigilator and do not answer a candidate's subject question || No previous invigilation is required || Able to sit and walk quietly || Able to follow a script exactly || A degree || Teaching experience || No formal qualification is required. Phones are not allowed in the hall. The job is only for the exam weeks.
College receptionist || Hammersmith Course Gate || education || Hammersmith || entry || full-time || permanent || on-site || year:24400 || days || Reception for a fictional further-education college. You book visitors and answer course-date questions from a list. || Sign visitors in || Answer course-date questions from the list and pass other questions on || Sort the student post || No previous college job is required || Clear spoken English || Confident with a phone || A teaching qualification || Another language || No teaching qualification is required.
Lab technician || Southall Science Prep || education || Southall || some || full-time || permanent || on-site || year:27000 || term || Prepare science practicals for a fictional secondary school and clear them away safely. Term time plus one week. || Set out the practical from the technician sheet || Clear away and store chemicals as the sheet says || Tell the head of science if stock is low || At least one year as a school technician, or a science A level plus a willingness to train || Careful with chemicals || Organised || A science degree || A first-aid certificate || A science degree is not required. A year as a technician, or a science A level with training, is required.
Lunchtime supervisor || Brentford Playground || education || Brentford || entry || part-time || permanent || on-site || hour:12.40 || term || Supervise the fictional school playground at lunch. One hour a day in term time. || Watch the playground || Follow the school's rule for a disagreement || Report an injury to the school office || No previous school job is required || Reliable at the same hour each day || Patient || A teaching assistant qualification || First aid || No formal qualification is required. The hour is the middle of the day, term time only.
"""
    jobs = []
    for line in raw.strip().splitlines():
        parts = [part.strip() for part in line.split("||")]
        if len(parts) != 20:
            raise SystemExit(f"Expected 20 fields, got {len(parts)}: {line[:120]}")
        (
            title, employer, category, town, experience, hours, contract, workplace,
            pay, pattern, summary, d1, d2, d3, e1, e2, e3, de1, de2, qual,
        ) = parts
        if ":" not in pay:
            raise SystemExit(pay)
        period, amount = pay.split(":", 1)
        if "-" in amount:
            pay_min, pay_max = amount.split("-")
        else:
            pay_min = pay_max = amount
        hpw = 37.5 if hours == "full-time" else 18
        if pattern == "mornings":
            hpw = 20
        if pattern == "evenings":
            hpw = 18
        if "one hour" in summary.lower() or "1 hour a day" in summary.lower():
            hpw = 5
        if "three days" in summary.lower():
            hpw = 22
        if "four days a week" in summary.lower():
            hpw = 28
        sponsorship = "not-offered"
        condition = None
        # A few skilled vacancies offer sponsorship. The condition is copied into the qualification line.
        if employer in {"Wembley Deskworks"}:
            pass
        apprentice = "apprentice" in title.lower() or "apprenticeship" in summary.lower()
        city, postcode = PLACES[town]
        job = {
            "title": title,
            "employer": employer,
            "category": category,
            "town": town,
            "city": city,
            "postcode": postcode,
            "payPeriod": period,
            "payMin": float(pay_min) if period == "hour" else int(pay_min),
            "payMax": float(pay_max) if period == "hour" else int(pay_max),
            "hoursPerWeek": hpw,
            "hours": hours,
            "hoursDetail": shift(pattern, hours),
            "contract": contract,
            "workplace": workplace,
            "experience": experience,
            "summary": summary,
            "responsibilities": [d1, d2, d3],
            "essential": [e1, e2, e3],
            "desirable": [de1, de2],
            "qualifications": [qual],
            "benefits": ["Holiday pay on top of the rate shown" if period == "hour" else "25 days of holiday plus bank holidays"],
            "howToApply": "Select Apply now. Use fictional details. This practice form is not sent to the employer.",
            "keywords": [category],
            "sponsorship": sponsorship,
        }
        if condition:
            job["sponsorshipCondition"] = condition
        if apprentice:
            job["apprenticeship"] = True
        sponsor_at = {
            "Hounslow Ward Practice": "A registered nursing associate qualification with the NMC",
            "Hammersmith Set Out": "A degree or HND in civil engineering, or a completed technician apprenticeship plus five years",
            "Greenford Fuse Board": "A City and Guilds 2391 or equivalent inspection qualification, and a completed apprenticeship or equivalent experience",
            "Hounslow Month End": "A part-qualified or qualified accountant, such as AAT Level 4, CIMA, ACCA or ACA",
        }
        if employer in sponsor_at:
            job["sponsorship"] = "available"
            job["sponsorshipCondition"] = sponsor_at[employer]
        jobs.append(job)
    return jobs


def main():
    jobs = []
    for index, item in enumerate(PINNED, start=2001):
        (
            title, employer, category, town, experience, hours, contract, workplace,
            pay_period, pay_min, pay_max, hpw, pattern, sponsorship, condition,
            summary, responsibilities, essential, desirable, qualification, benefits, how, apprenticeship, keywords,
        ) = item
        city, postcode = PLACES[town]
        job = {
            "id": f"wfj-{index}",
            "title": title,
            "employer": employer,
            "category": category,
            "town": town,
            "city": city,
            "postcode": postcode,
            "payPeriod": pay_period,
            "payMin": pay_min,
            "payMax": pay_max,
            "hoursPerWeek": hpw,
            "hours": hours,
            "hoursDetail": pattern,
            "contract": contract,
            "workplace": workplace,
            "experience": experience,
            "summary": summary,
            "responsibilities": responsibilities,
            "essential": essential,
            "desirable": desirable,
            "qualifications": [qualification],
            "postedOn": "2026-10-06",
            "closesOn": "2026-11-20" if index != 2004 else "2026-11-18",
            "sponsorship": sponsorship,
            "benefits": benefits,
            "howToApply": how,
            "keywords": keywords,
        }
        if condition:
            job["sponsorshipCondition"] = condition
        if apprenticeship:
            job["apprenticeship"] = True
        jobs.append(job)
    posted = ["2026-09-22", "2026-09-29", "2026-10-03", "2026-10-08", "2026-10-13", "2026-10-16"]
    closes = ["2026-11-06", "2026-11-13", "2026-11-20", "2026-11-27", "2026-12-04", "2026-12-11"]
    for offset, job in enumerate(bulk()):
        job["id"] = f"wfj-{2001 + len(jobs)}"
        job["postedOn"] = posted[offset % len(posted)]
        job["closesOn"] = closes[offset % len(closes)]
        jobs.append(job)
    path = Path(__file__).resolve().parents[1] / "seeds" / "vacancy-expansion.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(jobs, indent=2) + "\n")
    print(f"Wrote {len(jobs)} pinned vacancies to {path}")


if __name__ == "__main__":
    main()
