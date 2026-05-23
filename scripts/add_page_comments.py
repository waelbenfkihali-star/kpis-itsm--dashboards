from pathlib import Path
root = Path('src/page')

def summarize(path):
    folder = path.parent.name
    name = path.name
    lower = name.lower()
    if folder == 'analysis':
        if lower == 'chartlegend.jsx':
            return 'hna component legend ta3 charts fi analysis pages'
        if lower == 'analysisutils.js':
            return 'hna utils functions li y3awno b analysis w chart data'
        if lower == 'reportinsights.js':
            return 'hna builder ta3 insights w summary text li yjib men analysis data'
        if lower == 'selectionanalysisdashboard.jsx':
            return 'hna page analysis generique li tben dashboard men rows selected'
        if lower == 'kpinavigation.js':
            return 'hna helper li ya3mel navigation mta3 KPI modules'
    if folder == 'dashboard':
        if lower == 'dashboard.jsx':
            return 'hna page dashboard l utama li tben overview w charts general'
        if lower in {'row1.jsx', 'row2.jsx', 'row3.jsx'}:
            return 'hna row ta3 dashboard li tben cards w mini charts'
        if lower == 'card.jsx':
            return 'hna component card li yest3emel fi dashboard rows'
    if folder == 'ai':
        if lower == 'assistantdashboard.jsx':
            return 'hna page AI assistant li yfassar user request w ybni dashboard intent'
        if lower == 'promptplaybook.js':
            return 'hna helper li fih examples ta3 prompt l AI dashboard'
    if folder == 'changes':
        if lower == 'changes.jsx':
            return 'hna page changes list w filter w analysis'
        if lower == 'changedetails.jsx':
            return 'hna page detail ta3 change wahda'
        if lower == 'changesanalysis.jsx':
            return 'hna analysis page khusus b changes'
        if lower == 'mockchanges.js':
            return 'hna mock data ta3 changes l testing'
    if folder == 'incidents':
        if lower == 'incidents.jsx':
            return 'hna page incidents list w filter w analyse'
        if lower == 'incidentdetails.jsx':
            return 'hna page detail ta3 incident wahda'
        if lower == 'incidentsanalysis.jsx':
            return 'hna analysis page khusus b incidents'
        if lower == 'mockincidents.js':
            return 'hna mock data ta3 incidents l testing'
    if folder == 'requests':
        if lower == 'requests.jsx':
            return 'hna page requests list w filter w analyse'
        if lower == 'requestdetails.jsx':
            return 'hna page detail ta3 request wahda'
        if lower == 'requestsanalysis.jsx':
            return 'hna analysis page khusus b requests'
        if lower == 'mockrequests.js':
            return 'hna mock data ta3 requests l testing'
    if folder == 'Kpis':
        if lower == 'kpiform.jsx':
            return 'hna page define KPI form w save'
        if lower == 'mykpis.jsx':
            return 'hna page list ta3 Kpis li 3andek'
        if lower == 'kpifieldsform.jsx':
            return 'hna form input fields li t3ayet men Kpi form'
        if lower == 'kpiformconfig.js':
            return 'hna config w initial values ta3 KPI form'
        if lower == 'kpistorage.js':
            return 'hna storage helper li y7adhhir Kpis fl localStorage'
        if lower == 'kpicatalog.js':
            return 'hna catalog ta3 default KPI definitions'
        if lower == 'editkpi.jsx':
            return 'hna page edit KPI existing'
        if lower == 'kpide tails.jsx':
            return 'hna page show details ta3 KPI'
        if lower == 'kpide tails.jsx':
            return 'hna page show details ta3 KPI'
        if lower == 'kpifieldspopup.js':
            return 'hna helper'
        if lower == 'kpiformconfig.js':
            return 'hna KPI form config'
        if lower == 'kpistorage.js':
            return 'hna KPI storage helper'
    if folder == 'team':
        if lower == 'team.jsx':
            return 'hna page manage team w user accounts'
        if lower == 'data.js':
            return 'hna sample data w helper ta3 team list'
    if folder == 'importExcel':
        if lower == 'importexcel.jsx':
            return 'hna page import excel l upload ta3 source data'
    if folder == 'faq':
        if lower == 'faq.jsx':
            return 'hna page FAQ li t3ti explanations 3la workflow'
    if folder == 'contacts':
        if lower == 'contacts.jsx':
            return 'hna page contacts w list ta3 contacts'
        if lower == 'data.js':
            return 'hna sample contacts data'
    if folder == 'geography':
        if lower == 'geography.jsx':
            return 'hna page geography li tben map w service regions'
        if lower == 'geo.jsx':
            return 'hna helper component li ydessin hex map nodes'
    if folder == 'barChart':
        if lower == 'barchart.jsx':
            return 'hna page bar chart example'
        if lower == 'bar.jsx':
            return 'hna component ta3 bar chart'
    if folder == 'pieChart':
        if lower == 'piechart.jsx':
            return 'hna page pie chart example'
        if lower == 'pie.jsx':
            return 'hna component ta3 pie chart'
    if folder == 'lineChart':
        if lower == 'linechart.jsx':
            return 'hna page line chart example'
        if lower == 'line.jsx':
            return 'hna component ta3 line chart'
    if folder == 'Login':
        if lower == 'login.jsx':
            return 'hna page login w authentication'
    if folder == 'profile':
        if lower == 'profile.jsx':
            return 'hna page profile w update account info'
    if folder == 'notFound':
        if lower == 'notfound.jsx':
            return 'hna page not found message'
    return f'hna module li ykhdem fil page {folder}/{name}'

for path in sorted(root.rglob('*.jsx')) + sorted(root.rglob('*.js')):
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()
    if lines and lines[0].startswith('//') and ('hna' in lines[0] or 'page' in lines[0] or 'module' in lines[0]):
        continue
    if len(lines) > 1 and lines[0].strip() == '' and lines[1].startswith('//') and ('hna' in lines[1] or 'page' in lines[1] or 'module' in lines[1]):
        continue
    desc = summarize(path)
    comment = f'// {desc}'
    if text.startswith('// @ts-ignore'):
        new_text = '\n'.join([lines[0], comment] + lines[1:])
    else:
        new_text = comment + '\n' + text
    path.write_text(new_text, encoding='utf-8')
    print(f'updated {path}')
