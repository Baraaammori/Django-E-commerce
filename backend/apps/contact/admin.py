from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['subject', 'email', 'first_name', 'last_name', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['email', 'subject', 'message']
    list_editable = ['is_read']
    readonly_fields = ['created_at']
