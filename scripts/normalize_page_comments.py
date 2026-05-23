from pathlib import Path
import re

page_root = Path('src/page')
comment_re = re.compile(
    r'^(?P<indent>\s*)//\s*hna function\s+(?P<name>[A-Za-z_][A-Za-z0-9_]*)\s+li\s+t3ayetou\s+men\s+hadha\s+lmodule\s*$',
    re.IGNORECASE,
)

PAGE_COMPONENTS = {
    'Dashboard', 'Team', 'FAQ', 'Profile', 'ImportExcel', 'AssistantDashboard',
    'Requests', 'Incidents', 'Changes', 'KpiForm', 'MyKpis', 'EditKpi',
    'KpiDetails', 'Geography', 'LineChart', 'PieChart', 'NotFound',
    'RequestDetails', 'IncidentDetails', 'ChangeDetails',
    'RequestsAnalysis', 'IncidentsAnalysis', 'ChangesAnalysis',
    'SelectionAnalysisDashboard', 'Contacts', 'KpiFieldsForm', 'BarChart',
    'Row1', 'Row2', 'Row3', 'ImportExcel', 'Login', 'Form', 'EditKpi',
}


def infer_comment(name):
    if name in PAGE_COMPONENTS or name[0].isupper():
        return f'hna component {name} li trender page/component section'

    lower = name.lower()
    if lower.startswith('get'):
        return f'hna function {name} li tqra w troje3 value'
    if lower.startswith('build'):
        return f'hna function {name} li tbni object/data structure'
    if lower.startswith('load'):
        return f'hna function {name} li tload data w troje3 response'
    if lower.startswith('fetch'):
        return f'hna function {name} li tfetchi data men source'
    if lower.startswith('handle'):
        return f'hna function {name} li thandle event w tmanage action'
    if lower.startswith('submit'):
        return f'hna function {name} li tsubmit form data'
    if lower.startswith('reset'):
        return f'hna function {name} li trédoui state / filters l default'
    if lower.startswith('set'):
        return f'hna function {name} li tset field / state value'
    if lower.startswith('is'):
        return f'hna function {name} li tfassi boolean condition'
    if lower.startswith('parse'):
        return f'hna function {name} li tparse input data'
    if lower.startswith('normalize'):
        return f'hna function {name} li tnormalize value'
    if lower.startswith('filter') or lower.endswith('filter'):
        return f'hna function {name} li tfilter rows/data'
    if lower.startswith('build'):
        return f'hna function {name} li tbni data structure'
    if lower.startswith('make'):
        return f'hna function {name} li tprepare data output'
    if 'chart' in lower:
        return f'hna function {name} li tprepare/chart render logic'
    if 'card' in lower:
        return f'hna function {name} li troje3 card component layout'
    if 'detail' in lower:
        return f'hna function {name} li tdisplay detail view'
    if 'data' in lower:
        return f'hna function {name} li tprepare data values'
    return f'hna function {name} li tperform helper logic'


for path in sorted(page_root.rglob('*.js')) + sorted(page_root.rglob('*.jsx')):
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()
    changed = False
    new_lines = []
    for line in lines:
        m = comment_re.match(line)
        if m:
            indent = m.group('indent')
            name = m.group('name')
            comment = infer_comment(name)
            new_lines.append(f'{indent}// {comment}')
            changed = True
        else:
            new_lines.append(line)
    if changed:
        path.write_text('\n'.join(new_lines) + '\n', encoding='utf-8')
        print(f'updated {path}')
