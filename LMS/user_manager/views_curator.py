from .models import Student, Grade

def curator_can_access_student(student, curator_grades):
    grade_num = str(student.grade_num)
    grade_let = student.grade_let

    grade_lets = curator_grades.get(grade_num)
    if (grade_lets):
        return (grade_let in grade_lets)
    else:
        return False
    
def get_curator_grades(lms_user):
    grades_objects = list(Grade.objects.filter(curator=lms_user))

    grades = {}
    for grade in grades_objects:
        if grade.grade_num in grades:
            grades[grade.grade_num].append(grade.grade_let)
        else:
            grades[grade.grade_num] = [grade.grade_let]
    return grades