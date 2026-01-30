import React from 'react';
import { Mail, MessageSquare, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Contact = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold font-display text-slate-900 mb-6">{t('marketing.contact.title')}</h1>
                    <p className="text-xl text-slate-600">
                        {t('marketing.contact.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('marketing.contact.email_support')}</h3>
                                <p className="text-slate-600 mb-2">{t('marketing.contact.email_desc')}</p>
                                <a href="mailto:support@hostshield.com" className="text-primary font-medium hover:underline">support@hostshield.com</a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 flex-shrink-0">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('marketing.contact.live_chat')}</h3>
                                <p className="text-slate-600 mb-2">{t('marketing.contact.chat_desc')}</p>
                                <span className="text-slate-500 text-sm">Mon-Fri, 9am - 5pm CET</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-violet-600 flex-shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">{t('marketing.contact.office')}</h3>
                                <p className="text-slate-600">
                                    HostShield HQ<br />
                                    Tech Boulevard 101<br />
                                    Bratislava, Slovakia
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                        <form className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">{t('marketing.contact.form.name')}</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">{t('marketing.contact.form.email')}</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="john@company.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">{t('marketing.contact.form.message')}</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                {t('marketing.contact.form.submit')}
                            </button>
                            <p className="text-xs text-slate-500 text-center">
                                {t('marketing.contact.form.response_time')}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
