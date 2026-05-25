from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET_DIRS = [ROOT / "src", ROOT / "backend" / "itsm_data"]
TARGET_SUFFIXES = {".js", ".jsx", ".py"}


JS_MODULE_MAP = {
    "src/App.jsx": "hne l interface principale mta3 l app ba3d ma l user ya3mel login: tjib infos mta3 current user, taffichi TopBar w SideBar, w tbadel page dakhil l Outlet hasb route.",
    "src/main.jsx": "hne no9tet bidayet l frontend: na3mlou theme, n7adrou routes lkol, w nmountiw React app.",
    "src/utils/api.js": "hne helpers mta3 l API: nabniw links, n3adiw token fil headers, na3mlou refresh session, w nmasikou errors.",
    "src/theme.jsx": "hne theme mta3 l app: alwen, tokens, w settings mta3 light mode w dark mode.",
    "src/auth/ProtectedRoute.jsx": "hne route guard: ila ma famech access token ma ykhallich l user yodkhel lel pages el mahmiyin.",
    "src/auth/RoleRoute.jsx": "hne route guard hasb role: yet2aked elli l user 3andou access mnasba 9bal ma y7ell page mo3ayna.",
    "src/auth/roleUtils.js": "hne helpers sghar ywa7dou access mta3 l user bech ba9i l app yesta3mel nafs l format.",
    "src/components/TopBar.jsx": "hne l bar elli fou9: menha l user y7ell sidebar, ybadel theme, w yodkhel lel profile.",
    "src/components/SideBar.jsx": "hne menu elli 3al isar: menha l user yitnavigui bin pages mta3 l app w ya3mel logout.",
    "src/components/Header.jsx": "hne component mouchterek lel title w subtitle mta3 kol page.",
    "src/components/DeleteToolbar.jsx": "hne toolbar mouchterek lel delete: menou l user yfasakh selected rows wala lkol.",
    "src/components/ExportPdfButton.jsx": "hne zerr export PDF: y7awel l report wala dashboard l fichier PDF.",
    "src/components/ExecutiveSummary.jsx": "hne bloc summary sghir ya3ti fekra 3la aham points 9bal ma l user ychouf charts.",
    "src/components/GlobalScopeFilters.jsx": "hne component mouchterek lel filters l 3amma kif search, dates, w options okhra.",
    "src/components/PageFilters.jsx": "hne wrapper lel filters fi ay page: fih title, reset, w count mta3 filters l mef3lin.",
    "src/components/PrintReportHeader.jsx": "hne header mta3 print/export bech report yodhher mnadhem.",
    "src/components/InsightAssistant.jsx": "hne zerr AI elli yodhher fou9 pages bech y7ell assistant dashboard builder.",
    "src/components/insightAssistantUtils.js": "hne local logic mta3 AI dashboard: yfasser prompt, y7adher data, w ybni result local 9bal refinement men backend.",
    "src/page/dashboard/Dashboard.jsx": "hne saf7et dashboard l ra2isiya: tjib incidents w requests w changes, t7seb KPIs, w ta3mel charts w summary.",
    "src/page/importExcel/ImportExcel.jsx": "hne page import Excel: l user yikhtar files, ychouf preview, w yba3ethhom lel backend bech yodkhlou fel database.",
    "src/page/incidents/Incidents.jsx": "hne page incidents: fiha tableau, filters, delete, w selection mta3 rows bech yet7alllou.",
    "src/page/requests/Requests.jsx": "hne page requests: fiha tableau, filters, delete, w selection mta3 rows bech yet7alllou.",
    "src/page/changes/Changes.jsx": "hne page changes: fiha tableau, filters, delete, w selection mta3 rows bech yet7alllou.",
    "src/page/incidents/IncidentDetails.jsx": "hne page detail mta3 incident wa7da: tjib ticket hasb number w tori informations mta3ha.",
    "src/page/requests/RequestDetails.jsx": "hne page detail mta3 request wa7da: tjib ticket hasb number w tori informations mta3ha.",
    "src/page/changes/ChangeDetails.jsx": "hne page detail mta3 change wa7da: tjib ticket hasb number w tori informations mta3ha.",
    "src/page/incidents/IncidentsAnalysis.jsx": "hne page analysis mta3 incidents l mokhtarin: tebni KPIs w charts w insights 3lihom.",
    "src/page/requests/RequestsAnalysis.jsx": "hne page analysis mta3 requests l mokhtarin: tebni KPIs w charts w insights 3lihom.",
    "src/page/changes/ChangesAnalysis.jsx": "hne page analysis mta3 changes l mokhtarin: tebni KPIs w charts w insights 3lihom.",
    "src/page/analysis/SelectionAnalysisDashboard.jsx": "hne dashboard generic lel analysis: ye5ou rows mokhtarin men ay module w yaffichi KPIs w charts w detail grid.",
    "src/page/analysis/analysisUtils.js": "hne utilities mta3 analysis: t7seb monthly series, counts, breakdowns, legends, w tooltips mta3 charts.",
    "src/page/analysis/reportInsights.js": "hne functions tebni jomel summary w insights men l ar9am elli t7asbou fil dashboards.",
    "src/page/analysis/ChartLegend.jsx": "hne component sghir yaffichi legend mta3 alwen l chart.",
    "src/page/analysis/kpiNavigation.js": "hne helpers ywaslou module esmou b route s7i7a w label mnasba.",
    "src/page/ai/AssistantDashboard.jsx": "hne page AI dashboard builder: l user yekteb prompt b language 3adiya, w l app y7awlou l KPIs w charts w summary.",
    "src/page/ai/promptPlaybook.js": "hne exemples prompts y3awnou l user kifach yotlob dashboard men AI.",
    "src/page/Login/Login.jsx": "hne page login: l user yodkhel username/password, w ila s7a7 l app y5azen access w refresh tokens.",
    "src/page/profile/Profile.jsx": "hne page profile: l user ynajem ybadel ma3loumetou, password, w avatar.",
    "src/page/team/Team.jsx": "hne page team management: taffichi les comptes lkol w tkhallel admin ybadel access, status, password, wala yfasakh account.",
    "src/page/form/Form.jsx": "hne form creation compte jdid: l admin ya3mel user jdid m3a role w password.",
    "src/page/Kpis/MyKpis.jsx": "hne page KPI catalog: taffichi KPIs, tfiltrihom, w twassel l user lel module elli mrbout bihom.",
    "src/page/Kpis/Kpiform.jsx": "hne page creation KPI jdid w save mta3ou fil localStorage.",
    "src/page/Kpis/EditKpi.jsx": "hne page modification KPI mawjouda 9bal w update mta3ha fil stockage local.",
    "src/page/Kpis/KpiDetails.jsx": "hne page detail KPI: taffichi fields mta3ou lkol w ta3ti shortcut lel module elli mrbout bih.",
    "src/page/Kpis/KpiFieldsForm.jsx": "hne component fih fields l mouchterka bin create KPI w edit KPI.",
    "src/page/Kpis/kpiStorage.js": "hne logic stockage mta3 KPIs fil localStorage: load, validate, update, delete, w merge m3a default KPIs.",
    "src/page/Kpis/kpiCatalog.js": "hne default KPI catalog elli l app tebda bih men louel.",
    "src/page/Kpis/kpiFormConfig.js": "hne config mta3 KPI form: initial values w options l thabtin.",
    "src/page/faq/FAQ.jsx": "hne page FAQ bech tfasser kifach l app tekhdem w ajwiba 3la as2ila mta3 l users.",
    "src/page/notFound/NotFound.jsx": "hne page elli tban ki route mahouche mawjoud.",
    "src/page/contacts/Contacts.jsx": "hne page contacts fil partie demo/admin.",
    "src/page/contacts/data.js": "hne sample data mta3 contacts.",
    "src/page/dashboard/Row1.jsx": "hne row men layout 9dim fil dashboard fih cards wala charts sghar.",
    "src/page/dashboard/Row2.jsx": "hne row theni men layout 9dim fil dashboard fih cards wala charts sghar.",
    "src/page/dashboard/Row3.jsx": "hne row theleth men layout 9dim fil dashboard fih cards wala charts sghar.",
    "src/page/dashboard/card.jsx": "hne card component 9dim ken yetesta3mel fil dashboard l 9dim.",
    "src/page/dashboard/data.js": "hne data static lel demo fil dashboard l 9dim.",
    "src/page/barChart/BarChart.jsx": "hne page demo sghira bech twarek bar chart component.",
    "src/page/barChart/bar.jsx": "hne component mta3 bar chart l mosta3mel fil page demo.",
    "src/page/lineChart/LineChart.jsx": "hne page demo sghira bech twarek line chart component.",
    "src/page/lineChart/Line.jsx": "hne component mta3 line chart l mosta3mel fil page demo.",
    "src/page/pieChart/PieChart.jsx": "hne page demo sghira bech twarek pie chart component.",
    "src/page/pieChart/pie.jsx": "hne component mta3 pie chart l mosta3mel fil page demo.",
    "src/page/geography/Geography.jsx": "hne page geography view elli taffichi nadhra joughrafiya 3al services wala incidents.",
    "src/page/geography/geo.jsx": "hne component geographique custom yarsom nodes w zones w ar9am mrbouta bel intichar.",
}


PY_MODULE_MAP = {
    "backend/itsm_data/models.py": "hne models l asasiya fil Django elli tamthel incidents w requests w changes w profile mta3 user.",
    "backend/itsm_data/serializers.py": "hne serializers mta3 DRF: y7adhrou data 5arja lel frontend w yet7a99ou men data de5la men requests.",
    "backend/itsm_data/views.py": "hne aham API logic fil backend: import Excel, list/detail/delete lel records, team/profile management, w AI dashboard query.",
    "backend/itsm_data/urls.py": "hne routes mta3 backend fil app itsm_data: kol endpoint mrbout b view mta3ou.",
    "backend/itsm_data/ai_dashboard.py": "hne logic elli y7awel prompt mta3 user l intent mnadhem yefhmou l app bech yebni dashboard AI.",
    "backend/itsm_data/admin.py": "hne fichier Django admin mta3 app itsm_data.",
    "backend/itsm_data/apps.py": "hne config mta3 Django app itsm_data.",
    "backend/itsm_data/tests.py": "hne tests backend bech net2akdou elli APIs l ra2isiya tekhdem kif ma يلزم.",
}


EXPLICIT_PY_COMMENTS = {
    "sample_distinct_values": "hne function tjib chwaya values mokhtalfin men field mo3ayen bech nesta3mlouhom k context, خاصة lel AI.",
    "build_ai_data_context": "hne function tebni context men data mawjouda fil database bech AI yefhem services w groups w divisions l 7a9i9iyin.",
    "clean_text": "hne function tnadhhef text jey men Excel: tna7i les espaces zeydin w valeurs kif nan wala null.",
    "clean_name_like": "hne function tnadhhef fields elli yochbhou lel asami, w ila valeur fergha ترجع fallback mafhoum.",
    "clean_state": "hne function twa7ed l states l mokhtalfa elli jeya men source data l states mafhouma dakhil l app.",
    "clean_priority": "hne function twa7ed l priorities l format ma3rouf kif P1 w P2 w P3 w P4.",
    "to_bool": "hne function tebdel values kif yes/no wala 1/0 l true wala false.",
    "to_int": "hne function t7awel tebdel value l integer b tari9a amna, w ila tefchel ترجع 0.",
    "to_float": "hne function t7awel tebdel value l float b tari9a amna, w ila tefchel ترجع 0.",
    "normalize_date": "hne function twa7ed format mta3 date bech ba9i l app ynajem yeta3amel ma3aha بسهولة.",
    "read_excel_rows": "hne function ta9ra sheet l matloub men Excel, tna7i l takrar w l astor l fergha, w ترجع rows wajdin lel import.",
    "import_excel": "hne endpoint mta3 import: yodkhel incidents w requests w changes men Excel dakhil transaction wa7da.",
    "incidents_list": "hne endpoint يرجع liste incidents lkol mortbin men l a7deth lel a9dem.",
    "requests_list": "hne endpoint يرجع liste requests lkol mortbin men l a7deth lel a9dem.",
    "changes_list": "hne endpoint يرجع liste changes lkol mortbin men l a7deth lel a9dem.",
    "incident_detail": "hne endpoint يرجع details mta3 incident wa7da hasb number mawjouda fil route.",
    "request_detail": "hne endpoint يرجع details mta3 request wa7da hasb number mawjouda fil route.",
    "change_detail": "hne endpoint يرجع details mta3 change wa7da hasb number mawjouda fil route.",
    "delete_incidents": "hne endpoint yfasakh incidents l mokhtarin b ids w يرجع 9adeh men sater temsa7.",
    "delete_requests": "hne endpoint yfasakh requests l mokhtarin b ids w يرجع 9adeh men sater temsa7.",
    "delete_changes": "hne endpoint yfasakh changes l mokhtarin b ids w يرجع 9adeh men sater temsa7.",
    "monthly_stats": "hne endpoint y7seb overview b chhar yjamma3 incidents w requests w changes fil nafs l silsila الزمنiya.",
    "get_month": "hne helper sghir ye5ou date string w يرجع menha l juz2 YYYY-MM bech na3mlou grouping b chhar.",
    "ai_dashboard_query": "hne endpoint ye5ou prompt mta3 user w y7awlou l intent mnadhem bech saf7et AI dashboard تستعملو.",
    "current_user": "hne endpoint يرجع data mta3 l user elli 3amel login taw.",
    "update_current_user": "hne endpoint ybadel ma3loumet l user l 7ali w يرجع l neskha l mou7adtha.",
    "change_current_user_password": "hne endpoint ybadel password mta3 l user l 7ali ba3d validation.",
    "team_members": "hne endpoint fil GET يرجع les comptes lkol, w fil POST y5lo9 account jdid ila elli ba3eth request admin.",
    "team_member_detail": "hne endpoint ykhallel admin ybadel account mo3ayen wala yfasakhou, m3a 7imaya men self-delete w self-deactivate.",
    "team_member_password": "hne endpoint ykhallel admin ya3mel reset lel password mta3 user mo3ayen.",
}


DIRECTIVE_PREFIXES = (
    "// @",
    "// eslint",
    "// prettier",
    "// cspell",
    "# noqa",
    "# type:",
    "# pylint",
    "# flake8",
)


def is_directive_comment(line: str) -> bool:
    stripped = line.strip().lower()
    return any(stripped.startswith(prefix.lower()) for prefix in DIRECTIVE_PREFIXES)


def clean_ascii(text: str) -> str:
    text = re.sub(r"[^\x00-\x7F]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def js_comment_for(name: str) -> str:
    lower = name.lower()

    if lower.startswith("handle"):
        return clean_ascii(f"hne function {name}: tet9ad biha actions mta3 l user kif click, change, open, wala close, w ba3dha tbadel state wala navigation.")
    if lower.startswith("load"):
        return clean_ascii(f"hne function {name}: tchargi data wala context l lazem 9bal ma page taffichi contenu s7i7.")
    if lower.startswith("fetch"):
        return clean_ascii(f"hne function {name}: tjib data men backend w ترجعha b format tnajem l page تستعملou.")
    if lower.startswith("update"):
        return clean_ascii(f"hne function {name}: tbadel part men state wala data hasb l ma3loumet jdida.")
    if lower.startswith("filter"):
        return clean_ascii(f"hne function {name}: t5arrej kan rows wala data elli yjew ma3a filters l moufa3lin taw.")
    if lower.startswith("reset"):
        return clean_ascii(f"hne function {name}: ترجع l form wala l filters l 7ala l aslaya.")
    if lower.startswith("build"):
        return clean_ascii(f"hne function {name}: tebni structure jdida men data l raw bech chart wala widget yesta3melha.")
    if lower.startswith("make"):
        return clean_ascii(f"hne function {name}: t7adher data b format mnasba lel affichage wala l analyse.")
    if lower.startswith("render"):
        return clean_ascii(f"hne function {name}: ترجع contenu واجد باش يظهر fil UI.")
    if lower.startswith("get"):
        return clean_ascii(f"hne function {name}: ta9ra valeur mocht9a men data l 7aliya.")
    if lower.startswith("is"):
        return clean_ascii(f"hne function {name}: ترجع true wala false hasb condition mo3ayna fil logic.")
    if lower.startswith("parse"):
        return clean_ascii(f"hne function {name}: tfasser input w t7awlou l data mafhouma lel code.")
    if lower.startswith("normalize"):
        return clean_ascii(f"hne function {name}: twa7ed format mta3 valeur bech ba9i l app yeta3amel ma3aha b souhoula.")
    if lower.startswith("submit") or lower.startswith("onsubmit"):
        return clean_ascii(f"hne function {name}: تبعث form wala request lel backend w teta3amel m3a success wala error.")
    if lower.startswith("confirm"):
        return clean_ascii(f"hne function {name}: تكمل action ba3d ma l user y2akked men dialog wala warning.")
    if lower.endswith("rows"):
        return clean_ascii(f"hne variable {name}: فيها rows l nehayiya elli bech تتعرض ba3d filters wala selection.")
    if lower.endswith("data"):
        return clean_ascii(f"hne variable {name}: فيها data m7adhra lel affichage wala l analyse.")
    if lower.endswith("series"):
        return clean_ascii(f"hne variable {name}: فيها series wajda lel chart.")
    if lower.endswith("counts"):
        return clean_ascii(f"hne variable {name}: فيها counts m7soubin men data l 7aliya.")
    if lower.endswith("options"):
        return clean_ascii(f"hne variable {name}: فيها options elli bech يظهرou fil select wala autocomplete.")
    if lower.endswith("columns"):
        return clean_ascii(f"hne variable {name}: ta3ref columns mta3 DataGrid w kol colonne chnia tori.")
    if lower.endswith("label"):
        return clean_ascii(f"hne variable {name}: فيه label wejiz lel affichage fil UI.")
    if lower.endswith("path"):
        return clean_ascii(f"hne variable {name}: فيه route path elli nesta3mlouh fil navigation.")
    if lower.endswith("color"):
        return clean_ascii(f"hne variable {name}: يحدد l lawn l moust3mel fil interface.")
    if name and name[0].isupper():
        return clean_ascii(f"hne component {name}: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.")
    return clean_ascii(f"hne function {name}: t3awen ba9i l code fil fichier hedha b logic sghira.")


def py_comment_for(name: str, kind: str) -> str:
    lower = name.lower()

    if name in EXPLICIT_PY_COMMENTS:
        return clean_ascii(EXPLICIT_PY_COMMENTS[name])
    if kind == "class":
        return clean_ascii(f"hne class {name}: tamthel structure wala behavior مهم fil backend.")
    if lower.startswith("test_"):
        return clean_ascii(f"hne test {name}: yet2aked elli behavior hedha ma yetkasserch m3a changes jdod.")
    if lower == "__str__":
        return clean_ascii("hne __str__: ترجع esm ma9rou2 w sahl lel fahm wa9t nesta3mlou object hedha fil logs wala admin.")
    if lower.startswith("build"):
        return clean_ascii(f"hne function {name}: tebni payload wala context jdida men data mawjouda.")
    if lower.startswith("clean"):
        return clean_ascii(f"hne function {name}: tnadhhef data l raw 9bal ma todkhel lel database wala lel analyse.")
    if lower.startswith("normalize"):
        return clean_ascii(f"hne function {name}: twa7ed format mta3 valeur bech backend yeta3amel ma3aha b souhoula.")
    if lower.startswith("read"):
        return clean_ascii(f"hne function {name}: ta9ra source data w ترجعha b structure yefhmou backend.")
    if lower.startswith("delete"):
        return clean_ascii(f"hne function {name}: tfasakh records hasb l matloub w ترجع natijet l 3amaliya.")
    if lower.startswith("update"):
        return clean_ascii(f"hne function {name}: tbadel resource mawjouda hasb data l msada9 3liha.")
    if lower.startswith("import"):
        return clean_ascii(f"hne function {name}: todkhel source data lel database.")
    return clean_ascii(f"hne function {name}: t3awen fil logic mta3 backend dakhil hedha l fichier.")


def replace_module_comment(lines: list[str], comment_prefix: str, description: str) -> list[str]:
    if not lines:
        return [f"{comment_prefix} {clean_ascii(description)}"]

    insert_at = 0
    if lines[0].startswith("// @ts-ignore") or lines[0].startswith("#!/"):
        insert_at = 1

    while insert_at < len(lines):
        stripped = lines[insert_at].strip()
        if stripped == "":
            insert_at += 1
            continue
        if (comment_prefix == "//" and stripped.startswith("//")) or (comment_prefix == "#" and stripped.startswith("#")):
            lines.pop(insert_at)
            continue
        break

    lines.insert(insert_at, f"{comment_prefix} {clean_ascii(description)}")
    return lines


def replace_js_comments(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    lines = path.read_text(encoding="utf-8").splitlines()
    original = list(lines)

    cleaned: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("//") and not is_directive_comment(line):
            continue
        if re.match(r"^\s*{\s*/\*.*\*/\s*}\s*$", line):
            continue
        cleaned.append(line)

    module_description = JS_MODULE_MAP.get(rel)
    if module_description:
        cleaned = replace_module_comment(cleaned, "//", module_description)

    fn_re_list = [
        re.compile(r"^(\s*)export\s+default\s+function\s+([A-Za-z_][A-Za-z0-9_]*)\b"),
        re.compile(r"^(\s*)export\s+function\s+([A-Za-z_][A-Za-z0-9_]*)\b"),
        re.compile(r"^(\s*)function\s+([A-Za-z_][A-Za-z0-9_]*)\b"),
        re.compile(r"^(\s*)const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:async\s+)?\([^=]*=>"),
        re.compile(r"^(\s*)const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:async\s+)?[A-Za-z_][^=]*=>"),
    ]

    result: list[str] = []
    for line in cleaned:
        match = None
        for fn_re in fn_re_list:
            match = fn_re.match(line)
            if match:
                break
        if match:
            indent, name = match.groups()
            result.append(f"{indent}// {js_comment_for(name)}")
        result.append(line)

    if result != original:
        path.write_text("\n".join(result) + "\n", encoding="utf-8")
        return True
    return False


def replace_py_comments(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    lines = path.read_text(encoding="utf-8").splitlines()
    original = list(lines)

    cleaned: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("#") and not is_directive_comment(line):
            continue
        cleaned.append(line)

    module_description = PY_MODULE_MAP.get(rel)
    if module_description:
        cleaned = replace_module_comment(cleaned, "#", module_description)

    def_re = re.compile(r"^(\s*)(def|class)\s+([A-Za-z_][A-Za-z0-9_]*)\b")
    result: list[str] = []
    for line in cleaned:
        match = def_re.match(line)
        if match:
            indent, kind, name = match.groups()
            result.append(f"{indent}# {py_comment_for(name, kind)}")
        result.append(line)

    if result != original:
        path.write_text("\n".join(result) + "\n", encoding="utf-8")
        return True
    return False


def should_process(path: Path) -> bool:
    return path.suffix in TARGET_SUFFIXES and "__pycache__" not in path.parts


def main() -> None:
    changed: list[Path] = []
    for base in TARGET_DIRS:
        for path in sorted(base.rglob("*")):
            if not path.is_file() or not should_process(path):
                continue

            if path.suffix in {".js", ".jsx"}:
                if replace_js_comments(path):
                    changed.append(path)
            elif path.suffix == ".py":
                if replace_py_comments(path):
                    changed.append(path)

    for path in changed:
        print(path.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
