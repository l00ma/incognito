from django import forms
from django.utils.safestring import mark_safe
from django.contrib.auth.models import User

class ConnexionForm(forms.Form):
    username = forms.CharField(
        label="User:",
        max_length=32,
        widget=forms.TextInput(attrs={'class': 'glowing-border'})
        )

    password = forms.CharField(
        label="Password:",
        max_length=32,
        widget=forms.PasswordInput(attrs={'class': 'glowing-border'})
        )

class UpdateProfile(forms.ModelForm):
    username = forms.CharField(
        required=True,
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'glowing-border'})
        )

    email = forms.EmailField(
        required=True,
        max_length=254,
        widget=forms.TextInput(attrs={'class': 'glowing-border'})
        )

    password = forms.CharField(
        required=True,
        max_length=128,
        widget=forms.PasswordInput(attrs={'class': 'glowing-border'})
        )

    password2 = forms.CharField(
        required=True, 
        max_length=128, 
        widget=forms.PasswordInput(attrs={'class': 'glowing-border'})
        )

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def clean(self):
        cleaned_data = super(UpdateProfile, self).clean()
        username = cleaned_data.get('username')
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        password2 = cleaned_data.get('password2')

        if password and password2 and password != password2:
            raise forms.ValidationError('The two password fields must match.')
        return cleaned_data

    def save(self, commit=True):
        user = super(UpdateProfile, self).save(commit=False)
        user.set_password(self.cleaned_data["password"])

        if commit:
            user.save()

        return user

class UploadFileForm(forms.Form):
    file = forms.FileField(
        label=mark_safe('Add config files<br />(.ovpn or .conf)'),
        widget=forms.ClearableFileInput(attrs={'multiple': True, 'class': 'glowing-border'})
        )
