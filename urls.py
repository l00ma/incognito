"""incognito URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/fr/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from . import views
from django.contrib import admin
from django.contrib.auth import views as auth_views
handler404 = 'incognito.views.handler404'

admin.autodiscover()

urlpatterns = [
	url(r'^$', views.connex),
    url(r'^connexion/$', views.connex),
    url(r'^welcome/$', views.welcome),
    url(r'^welcome/welcome_data/$', views.auto_refresh_data),
    url(r'^welcome/welcome_data_set/$', views.manual_refresh_data),
    url(r'^welcome/save_auto/$', views.auto_saved_data),
    url(r'^welcome/save_manual/$', views.manual_saved_data),
    url(r'^welcome/save_vpn_dns/$', views.vpn_dns_saved_data),
    url(r'^vpn_config/$', views.manage_vpn_conf),
    url(r'^vpn_config/load_vpn_config/$', views.load_vpn_conf),
    url(r'^vpn_config/delete_vpn_config/$', views.delete_vpn_conf),
    url(r'^welcome/changeip/$', views.torchangeip),
    url(r'^welcome/adblocklistupdate/$', views.adblockupdate),
    url(r'^welcome/del_log/$', views.dellog),
    url(r'^welcome/read_log/$', views.readlog),
    url(r'^welcome/read_monitor/$', views.readmonitor),
    url(r'^profil/$', views.update_profile, name='update_profile'),
    #
    #url(r'^admin/', admin.site.urls),
    #
    url(r'^deconnexion/$', views.deconnexion),
    url(r'^password_reset/$', auth_views.PasswordResetView.as_view(), name='password_reset'),
    url(r'^password_reset/done/$', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,32})/$',
        auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    url(r'^reset/done/$', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
