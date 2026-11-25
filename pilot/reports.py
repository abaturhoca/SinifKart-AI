"""One report model shared by Excel and printable HTML exports."""
from collections import defaultdict
from html import escape
from io import BytesIO
import json


def report(db, class_id, exam):
    row=db.execute("select name,roster from classes where id=?",(class_id,)).fetchone()
    if row is None: raise ValueError("Sınıf bulunamadı.")
    names=json.loads(row['roster'])
    questions=list(db.execute("""select sessions.*,meta.outcome from sessions
        join meta using(token) where class_id=? and meta.exam=? order by sessions.rowid""",(class_id,exam)))
    if not questions: raise ValueError("Sınavda soru bulunamadı.")
    by_student=[['Kart','Öğrenci',*[f'S{i+1}' for i in range(len(questions))],'Doğru','Yanlış','Boş']]
    by_question=[['Soru','Metin','Kazanım','Anahtar','A','B','C','D','Yanıtsız','Doğru','En sık seçilen yanlış seçenek','Seçilme sayısı']]
    by_outcome=[['Kazanım','Doğru','Yanıtlanan','Olası yanıt','Yanıtlayanlarda başarı (%)','Katılım (%)']]
    groups=defaultdict(lambda:[0,0,0])
    answers=[]
    students_by_number={}
    for i,q in enumerate(questions,1):
        votes=dict(db.execute("select card,answer from votes where token=?",(q['token'],)))
        snapshot=db.execute("select students from session_cards where token=?",(q['token'],)).fetchone()
        enrolled=json.loads(snapshot[0]) if snapshot and snapshot[0] else [
            {'number':str(n),'name':name,'cardId':n} for n,name in enumerate(names,1)]
        for student in enrolled:
            students_by_number[student['number']]=student
        answers.append({student['number']:votes.get(student['cardId'],'') for student in enrolled})
        counts=[list(votes.values()).count(a) for a in 'ABCD']
        right=counts['ABCD'.index(q['correct'])]
        group=q['outcome'] or 'Kazanım belirtilmedi'
        totals=groups[group]
        totals[0]+=right
        totals[1]+=len(votes)
        totals[2]+=len(enrolled)
        wrong_counts={a:counts[j] for j,a in enumerate('ABCD'[:len(json.loads(q['opts']))]) if a!=q['correct']}
        peak=max(wrong_counts.values(),default=0)
        distractors=', '.join(a for a,n in wrong_counts.items() if peak and n==peak)
        by_question.append([i,q['title'],group,q['correct'],*counts,len(enrolled)-len(votes),right,distractors,peak])
    for number,student in students_by_number.items():
        values=[v.get(number,'') for v in answers]
        blank=values.count('')
        right=sum(a==q['correct'] for a,q in zip(values,questions))
        by_student.append([student['cardId'],student['name'],*values,right if blank<len(values) else None,len(values)-blank-right if blank<len(values) else None,blank])
    for key,(right,answered,possible) in groups.items():
        by_outcome.append([key,right,answered,possible,round(100*right/answered,1) if answered else None,round(100*answered/possible,1)])
    return {'Öğrenciler':by_student,'Sorular':by_question,'Kazanımlar':by_outcome}


def excel(tables):
    from openpyxl import Workbook
    from openpyxl.styles import Font
    book=Workbook()
    book.remove(book.active)
    for name,rows in tables.items():
        sheet=book.create_sheet(name)
        for row in rows:
            sheet.append(row)
            for cell in sheet[sheet.max_row]:
                if isinstance(cell.value,str):
                    cell.data_type='s'
        for cell in sheet[1]: cell.font=Font(bold=True)
        sheet.freeze_panes='C2' if name=='Öğrenciler' else 'B2'
        sheet.auto_filter.ref=sheet.dimensions
        for col in sheet.columns:
            sheet.column_dimensions[col[0].column_letter].width=min(55,max(9,max(len(str(c.value or '')) for c in col)+2))
    buf=BytesIO()
    book.save(buf)
    return buf.getvalue()


def printable(tables):
    page=['<!doctype html><html lang="tr"><meta charset="utf-8"><title>Sınav raporu</title><style>body{font:14px system-ui;margin:2rem}table{border-collapse:collapse}td,th{border:1px solid #aaa;padding:.3rem}thead{display:table-header-group}tr{break-inside:avoid}@media print{button{display:none}}@page{size:A4 landscape;margin:12mm}</style><h1>Sınav raporu</h1><button onclick="print()">Yazdır / PDF kaydet</button>']
    for section,rows in tables.items():
        page+=['<h2>'+escape(section)+'</h2><table><thead><tr>']
        page+=['<th>'+escape(str(c))+'</th>' for c in rows[0]]
        page+=['</tr></thead><tbody>']
        for row in rows[1:]:
            page+=['<tr>'+''.join('<td>'+escape(str(c) if c is not None else '—')+'</td>' for c in row)+'</tr>']
        page+=['</tbody></table>']
    return ''.join(page)+'</html>'
