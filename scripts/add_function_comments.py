from pathlib import Path
import re

root = Path('.')
backend_dir = root / 'backend' / 'itsm_data'
frontend_dir = root / 'src' / 'page'

py_name_map = {
    'sample_distinct_values': 'hna function li traji3 distinct values men queryset w field',
    'build_ai_data_context': 'hna function li tabni context data l AI dashboard',
    'clean_text': 'hna function li tnayye9 text w tro7ou empty string ila kan null',
    'clean_name_like': 'hna function li tro7 text w ida khawi tarja3 fallback',
    'clean_state': 'hna function li tnormalize state/status l format standard',
    'clean_priority': 'hna function li tnormalize priority l P1..P4',
    'to_bool': 'hna function li tbadel string l boolean',
    'to_int': 'hna function li tbadel value l integer safe',
    'to_float': 'hna function li tbadel value l float safe',
    'normalize_date': 'hna function li tnormalize datetime/text l timestamp string',
    'read_excel_rows': 'hna function li tqra Excel sheet w tro7 rows cleaned',
    'import_excel': 'hna endpoint li yimporti incidents/requests/changes men Excel upload',
    'incidents_list': 'hna API endpoint li yjib list ta3 incidents',
    'requests_list': 'hna API endpoint li yjib list ta3 requests',
    'changes_list': 'hna API endpoint li yjib list ta3 changes',
    'incident_detail': 'hna API endpoint li yjib detail ta3 incident b number',
    'request_detail': 'hna API endpoint li yjib detail ta3 request b number',
    'change_detail': 'hna API endpoint li yjib detail ta3 change b number',
    'delete_incidents': 'hna API endpoint li ymas7 incidents b ids',
    'delete_requests': 'hna API endpoint li ymas7 requests b ids',
    'delete_changes': 'hna API endpoint li ymas7 changes b ids',
    'monthly_stats': 'hna endpoint li yjib aggregated monthly stats',
    'get_month': 'hna helper li yextracti YYYY-MM men date string',
    'ai_dashboard_query': 'hna endpoint AI li ybni intent men prompt',
    'current_user': 'hna endpoint li yjib data ta3 user li mazal logged in',
    'update_current_user': 'hna endpoint li youpdate profile ta3 current user',
    'change_current_user_password': 'hna endpoint li tebdel password ta3 current user',
    'team_members': 'hna endpoint li yjib team members w ycreate new account ida admin',
    'team_member_detail': 'hna endpoint li tmanage user detail w tdelete user ida admin',
    'team_member_password': 'hna endpoint li treest password user ida admin',
}

js_name_map = {
    'countBy': 'hna function li tcounti rows b key w tro7 result grouped',
    'topLabel': 'hna function li tijib top label men rows b key',
    'ratio': 'hna function li tcalculate percent ratio',
    'parseDate': 'hna function li tparse date string l YYYY-MM',
    'monthlySeries': 'hna function li tbuild monthly series data',
    'buildMonthRange': 'hna helper li tbuild range ta3 months men rows',
    'monthlySeriesInRange': 'hna function li tbuild monthly series fl range specified',
    'monthlyDualSeries': 'hna function li tbuild dual series l chart',
    'monthlyDualSeriesInRange': 'hna function li tbuild dual series fl range',
    'monthlyBreakdown': 'hna function li tcalculate monthly breakdown by group',
    'monthlyBreakdownInRange': 'hna function li tcalculate monthly breakdown fl range',
    'average': 'hna function li tcalculate average value men rows',
    'countWhere': 'hna function li tcounti rows li ymatch predicate',
    'diffInDays': 'hna function li tcalculate difference fi days men date',
    'bucketAging': 'hna function li tclassify aging days fl buckets',
    'agingByState': 'hna function li tbuild aging totals by state',
    'makePieData': 'hna function li tprepare data format l pie chart',
    'makeBarData': 'hna function li tprepare data format l bar chart',
    'makeLineData': 'hna function li tprepare data format l line chart',
    'getChartColor': 'hna function li tajib color men palette',
    'makeLegendItems': 'hna function li tprepare legend items b colors',
    'renderBarTooltip': 'hna function li tgenerate tooltip text l bar chart',
    'renderLineTooltip': 'hna function li tgenerate tooltip text l line chart',
    'renderPieTooltip': 'hna function li tgenerate tooltip text l pie chart',
}


def has_comment_before(lines, index, comment_prefix):
    if index == 0:
        return False
    prev = lines[index - 1].strip()
    if prev.startswith(comment_prefix):
        return True
    if prev in {'"""', "'''"}:
        return True
    return False


def insert_comment(lines, index, comment):
    indent = re.match(r'^(\s*)', lines[index]).group(1)
    lines.insert(index, f'{indent}{comment}')


def process_python_file(path):
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()
    changed = False
    for idx, line in enumerate(list(lines)):
        match = re.match(r'^(\s*)(def|class)\s+([A-Za-z_][A-Za-z0-9_]*)\b', line)
        if not match:
            continue
        indent, kind, name = match.groups()
        if has_comment_before(lines, idx, '#'):
            continue
        comment_text = py_name_map.get(name)
        if not comment_text:
            if kind == 'class':
                comment_text = f'hna class {name} li tdefine model/w service' if 'Config' not in name else f'hna class {name} ta3 config'
            else:
                comment_text = f'hna function {name} li tdefine service logic'
        insert_comment(lines, idx, f'{indent}# {comment_text}')
        changed = True
    if changed:
        path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
        print(f'updated {path}')


def cleanse_js_comments(lines):
    result = []
    removed = False
    for line in lines:
        if re.match(r'^\s*//\s*hna\s+(function|helper)\b', line):
            removed = True
            continue
        result.append(line)
    return result, removed


def process_js_file(path):
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines()
    lines, cleaned = cleanse_js_comments(lines)
    changed = cleaned
    for idx in range(len(lines) - 1, -1, -1):
        line = lines[idx]
        if has_comment_before(lines, idx, '//'):
            continue
        js_match = None
        if m := re.match(r'^(\s*)export\s+default\s+function\s+([A-Za-z_][A-Za-z0-9_]*)\b', line):
            js_match = (m.group(1), m.group(2))
        elif m := re.match(r'^(\s*)export\s+function\s+([A-Za-z_][A-Za-z0-9_]*)\b', line):
            js_match = (m.group(1), m.group(2))
        elif m := re.match(r'^(\s*)function\s+([A-Za-z_][A-Za-z0-9_]*)\b', line):
            js_match = (m.group(1), m.group(2))
        elif m := re.match(r'^(\s*)const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:async\s+)?\(', line):
            js_match = (m.group(1), m.group(2))
        elif m := re.match(r'^(\s*)const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:async\s+)?[^=]+=>', line):
            js_match = (m.group(1), m.group(2))
        elif m := re.match(r'^(\s*)const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\(?[^)]*\)?\s*=>', line):
            js_match = (m.group(1), m.group(2))
        if not js_match:
            continue
        indent, name = js_match
        comment_text = js_name_map.get(name)
        if not comment_text:
            comment_text = f'hna function {name} li t3ayetou men hadha lmodule'
        insert_comment(lines, idx, f'{indent}// {comment_text}')
        changed = True
    if changed:
        path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
        print(f'updated {path}')


def main():
    for path in sorted(backend_dir.glob('*.py')):
        if path.name in {'__init__.py'}:
            continue
        process_python_file(path)
    for path in sorted(frontend_dir.rglob('*.js')) + sorted(frontend_dir.rglob('*.jsx')):
        process_js_file(path)


if __name__ == '__main__':
    main()
