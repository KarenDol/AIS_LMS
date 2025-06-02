from django.contrib import messages
from django.shortcuts import redirect
from functools import wraps

def role_required(*allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('login_user', prev_page='home')

            user_type = request.session.get('user_type')
            if user_type in allowed_roles:
                return view_func(request, *args, **kwargs)

            messages.error(request, 'Роль пользователя не соответствует требованиям доступа')
            return redirect('home')
        return _wrapped_view
    return decorator