from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class StudentCreationForm(UserCreationForm):
    Name = forms.CharField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ФИО Ребёнка'}))
    birth_date = forms.DateField(label="", widget=forms.DateInput(attrs={'class': 'form-control', 'placeholder': 'YYYY-MM-DD'}))
    IIN = forms.CharField(label="", max_length="12", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ИИН Ребёнка'}))
    Grade = forms.CharField(label="", max_length="2", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Класс'}))
    Nationality = forms.CharField(label="", max_length="15", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Национальность'}))
    Prev_School = forms.CharField(label="", max_length="15", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Прошлая школа'}))

    class Meta:
        model = User
        fields = ('Name', 'birth_date', 'IIN', 'Grade', 'Nationality', 'Prev_School')

    def __init__(self, *args, **kwargs):
        super(StudentCreationForm, self).__init__(*args, **kwargs)

        # Exclude username, password1, and password2
        # self.fields.pop('username')
        self.fields.pop('password1')
        self.fields.pop('password2')

class ParentCreationForm(UserCreationForm):
    First_Name = forms.CharField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Имя Родителя'}))
    Last_Name = forms.CharField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Фамилия Родителя'}))
    Patronim = forms.CharField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Отчество Родителя'}))
    Phone = forms.CharField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Номер Родителя'}))
    ID_number = forms.CharField(label="", max_length="7", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Номер удостоверения'}))
    ID_org = forms.CharField(label="", max_length="20", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'МВД РК'}))
    ID_date = forms.DateField(label="", widget=forms.DateInput(attrs={'class': 'form-control', 'placeholder': 'YYYY-MM-DD'}))
    Place = forms.CharField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Место Работы'}))
    Position = forms.CharField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Должность'}))

    class Meta:
        model = User
        fields = ('First_Name', 'Last_Name', 'Patronim', 'Phone', 'ID_number', 'ID_org', 'ID_date', 'Place', 'Position')

    def __init__(self, *args, **kwargs):
        super(ParentCreationForm, self).__init__(*args, **kwargs)

        # Exclude username, password1, and password2
        # self.fields.pop('username')
        self.fields.pop('password1')
        self.fields.pop('password2')

class ContractCreationForm(UserCreationForm):
    numb = forms.CharField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Номер Документа'}))
    sign_date = forms.DateField(label="", widget=forms.DateInput(attrs={'class': 'form-control', 'placeholder': 'Сегодняшняя дата YYYY-MM-DD'}))
    first_date = forms.DateField(label="", widget=forms.DateInput(attrs={'class': 'form-control', 'placeholder': 'Fisrt Date YYYY-MM-DD'}))
    last_date = forms.DateField(label="", widget=forms.DateInput(attrs={'class': 'form-control', 'placeholder': 'Last Date YYYY-MM-DD'}))
    total = forms.IntegerField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Total cost'}))
    discount = forms.IntegerField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Discount cost'}))
    monthly = forms.IntegerField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Monthly cost'}))
    join_fee = forms.IntegerField(label="", widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Join Fee'}))

    class Meta:
        model = User
        fields = ('numb', 'sign_date', 'first_date', 'last_date', 'total', 'discount', 'monthly', 'join_fee')

    def __init__(self, *args, **kwargs):
        super(ContractCreationForm, self).__init__(*args, **kwargs)

        # Exclude username, password1, and password2
        # self.fields.pop('username')
        self.fields.pop('password1')
        self.fields.pop('password2')