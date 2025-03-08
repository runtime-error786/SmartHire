"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from signup.views import signup,send_otp,verify_otp
from django.conf.urls.static import static
from django.conf import settings
from signin.views import sign_in,send_otp_signin,verify_otp_signin,reset_password,decode_jwt
from getUserData.views import get_user_data,get_user_role
from signout.views import logout_view
from profil.views import update_profile,get_profile
from JobList.views import get_jobs_for_recruiter,get_all_jobs
from createjob.views import get_recruiter_company,create_job
from AI_job_title.views import enhance_job_title
from Check_Ai_subs.views import has_ai_subscription,has_prac_subscription
from checkout.views import create_checkout_session,verify_payment,create_checkout_session_prac,verify_payment_prac
from Up_del_ret_job.views import get_job_by_id,update_job,delete_job,get_job_id
from Dashboard.views import get_dashboard_stats
from Dashboard.views import load_users,delete_user,subscribers,delete_subscription,delete_job,load_jobs,load_reported_jobs,delete_job_and_reports,delete_report
from report.views import create_report,check_report_status
from savejob.views import save_job,get_saved_jobs
from interview.views import get_interview_questions
from evaluation.views import check_answer
from technical.views import get_coding_questions
from technical_eval.views import evaluate_code
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('testapi.urls')),  
    path('signup/', signup, name='signup'),
    path('send_otp/', send_otp, name='send_otp'),
    path('verify_otp/', verify_otp, name='verify_otp'),
    path('login/', sign_in, name='login'),
    path('send-otp_signin/', send_otp_signin, name='send-otp'),
    path('verify_otp_signin/', verify_otp_signin, name='verify-otp'),
    path('reset_password/', reset_password, name='reset-password'),
    path('decode-jwt/', decode_jwt, name='decode_jwt'),
    path('get_picture/',get_user_data,name='get_user_data'),
    path('get_user_role/',get_user_role,name='get_role'),
    path('logout/', logout_view, name='logout'),
    path('profile/', get_profile, name='get_profile'),
    path('update_profile/', update_profile, name='update_profile'),
    path('getjobs/',get_jobs_for_recruiter, name='getjobs'),
    path('get_recruiter_company/',get_recruiter_company, name='get_recruiter_company'),
    path('createjob/',create_job, name='create_job'),
    path('generate-job-title/',enhance_job_title, name='generate-job-title'),
    path('has-ai-subscription/', has_ai_subscription, name='has_ai_subscription'),
    path('has-prac-subscription/', has_prac_subscription, name='has_prac_subscription'),
    path('create_checkout_session/', create_checkout_session, name='create_checkout_session'),
    path('verify_payment/', verify_payment, name='verify_payment'),
    path('create_checkout_session_prac/', create_checkout_session_prac, name='create_checkout_session'),
    path('verify_payment_prac/', verify_payment_prac, name='verify_payment'),
    path('get_job/<int:job_id>/', get_job_by_id, name='get_job_by_id'),
    path('updatejob/<int:job_id>/', update_job, name='update_job'),
    path('deletejob/<int:job_id>/', delete_job, name='delete_job'),
    path('get_all_job', get_all_jobs, name='get_all_job'),
    path('dashboard/', get_dashboard_stats, name='dashboard'),
    path('all_users/', load_users, name='load_users'),
    path('users/<int:user_id>/', delete_user, name='delete_user'),
    path('subscribers/', subscribers, name='subscribers'),
    path('delete_subscription/<int:subscription_id>/', delete_subscription, name='delete_subscription'),
    path('all_jobs/', load_jobs, name='load_jobs'),
    path('job/<int:job_id>/', delete_job, name='delete_job'),
    path('get_jobs/<int:job_id>/', get_job_id, name='get_jobs'),
    path('report/', create_report, name='create_report'),   
    path('load_reports/', load_reported_jobs, name='load_reports'),
    path('delete_job_report/<int:job_id>/', delete_job_and_reports, name='delete_job_and_reports'),
    path('delete_report/<int:report_id>/', delete_report, name='delete_report'),
    path('check_report_status/<int:job_id>/', check_report_status, name='check_report_status'),
    path('save_job/', save_job, name='save_job'),
    path('get_save_job/', get_saved_jobs, name='get_saved_jobs'),
    path('get_interview_questions/', get_interview_questions, name='get_interview_questions'),
    path('check_answer/', check_answer, name='check_answer'),
    path('get_coding_questions/', get_coding_questions, name='get_coding_questions'),
    path('evaluate_code/', evaluate_code, name='evaluate_code')
    
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
