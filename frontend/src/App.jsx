import React, { useState, useEffect } from 'react';
import { Mail, Search, AlertCircle, RefreshCw, Inbox, FileText, ArrowLeft } from 'lucide-react';

const BLOCKED_USERNAMES = ['admin', 'user', 'root', 'support', 'info', 'test', 'webmaster', 'administrator'];
const DOMAIN = '@tzmssamns.tech';
const API_BASE_URL = 'https://temp-mail.fredyyusuf174.workers.dev';

export default function App() {
    const [username, setUsername] = useState('');
    const [activeUsername, setActiveUsername] = useState('');
    const [error, setError] = useState('');
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [loading, setLoading] = useState(false);

    const validateUsername = (user) => {
        if (!user) return "Username aktif tidak boleh kosong.";
        if (BLOCKED_USERNAMES.includes(user.toLowerCase())) {
            return "Username ini tidak diizinkan untuk digunakan.";
        }
        return "";
    };

    const handleUsernameChange = (e) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setUsername(val);
        const validationError = validateUsername(val);
        setError(validationError);
    };

    const fetchEmails = async (userToFetch) => {
        const validationError = validateUsername(userToFetch);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/emails/${userToFetch}`);

            if (response.status === 403) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Username ini tidak diizinkan untuk digunakan.");
            }

            if (!response.ok) {
                throw new Error("Gagal memeriksa inbox. Coba cek internet Anda.");
            }

            const data = await response.json();
            setEmails(data.emails);
            setActiveUsername(userToFetch);
            setSelectedEmail(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmailDetail = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/emails/detail/${id}`);
            if (!response.ok) throw new Error("Gagal mengambil rincian email dari server.");
            const data = await response.json();
            setSelectedEmail(data.email);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchEmails(username);
    };

    useEffect(() => {
        let intervalId;
        if (activeUsername && !error) {
            intervalId = setInterval(() => {
                fetchEmails(activeUsername);
            }, 10000);
        }
        return () => clearInterval(intervalId);
    }, [activeUsername, error]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <header className="bg-white border-b border-slate-200 pt-16 pb-12 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    <Mail className="mx-auto h-16 w-16 text-indigo-600 mb-6" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Cloudflare Temp Mail
                    </h1>
                    <p className="text-lg text-slate-500 mb-8">
                        Dapatkan alamat email sekali pakai yang cepat, aman, dan tanpa spam pribadi.
                    </p>

                    <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex bg-slate-100 rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                            <input
                                type="text"
                                placeholder="buat-username"
                                className="flex-1 bg-transparent py-3 px-4 outline-none text-slate-800 font-medium"
                                value={username}
                                onChange={handleUsernameChange}
                            />
                            <div className="bg-slate-200 py-3 px-4 text-slate-600 font-semibold border-l border-slate-300 flex items-center">
                                {DOMAIN}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!!error || !username || loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Search size={20} />
                            Cek Inbox
                        </button>
                    </form>

                    {error && (
                        <div className="max-w-xl mx-auto mt-4 flex items-center gap-2 text-rose-600 justify-center bg-rose-50 border border-rose-100 p-3 rounded-lg text-sm font-medium">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {activeUsername && !error && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:h-[600px]">

                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                    <Inbox className="text-indigo-600" size={20} />
                                    Inbox Real-time
                                </h2>
                                <p className="text-sm font-medium text-slate-500">{activeUsername}{DOMAIN}</p>
                            </div>
                            <button
                                onClick={() => fetchEmails(activeUsername)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                            >
                                <RefreshCw size={16} className={loading && !selectedEmail ? "animate-spin" : ""} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                            <div className={`${selectedEmail ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[35%] lg:w-[30%] border-r border-slate-200 bg-slate-50/50`}>
                                {!loading && emails.length === 0 && (
                                    <div className="p-10 text-center text-slate-400 mt-10">
                                        <Inbox className="mx-auto h-12 w-12 mb-3 opacity-30" />
                                        <p className="font-medium text-slate-600">Inbox masih kosong.</p>
                                        <p className="text-xs mt-1">Menunggu email masuk...</p>
                                    </div>
                                )}

                                <ul className="divide-y divide-slate-200 overflow-y-auto flex-1">
                                    {emails.map((m) => (
                                        <li key={m.id}>
                                            <button
                                                onClick={() => fetchEmailDetail(m.id)}
                                                className={`w-full text-left p-4 hover:bg-indigo-50/50 transition-colors ${selectedEmail?.id === m.id ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                                            >
                                                <div className="font-semibold text-slate-800 truncate mb-1">{m.sender}</div>
                                                <div className="text-sm text-slate-600 truncate mb-2">{m.subject}</div>
                                                <div className="text-xs text-slate-400 font-medium">{new Date(m.created_at).toLocaleString()}</div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={`${!selectedEmail ? 'hidden md:flex' : 'flex'} w-full md:w-[65%] lg:w-[70%] bg-white flex-col overflow-hidden`}>
                                {!selectedEmail ? (
                                    <div className="m-auto text-center text-slate-300 hidden md:block">
                                        <FileText className="mx-auto h-20 w-20 mb-4 opacity-50" />
                                        <p className="text-slate-500 font-medium">Pilih pesan di inbox untuk melihat isinya</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full">
                                        <div className="p-6 border-b border-slate-100 shrink-0">
                                            <button
                                                onClick={() => setSelectedEmail(null)}
                                                className="md:hidden mb-6 text-indigo-600 text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-lg -ml-3"
                                            >
                                                <ArrowLeft size={16} /> Kembali ke Inbox
                                            </button>

                                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-snug">{selectedEmail.subject}</h3>
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-4">
                                                <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <p className="text-slate-700 break-all"><span className="text-slate-400 font-medium mr-2">Dari:</span>{selectedEmail.sender}</p>
                                                    <p className="text-slate-700 mt-1 break-all"><span className="text-slate-400 font-medium mr-2">Kepada:</span>{selectedEmail.recipient}</p>
                                                </div>
                                                <p className="text-slate-500 font-medium shrink-0 bg-slate-50 py-1.5 px-3 rounded-md">{new Date(selectedEmail.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="p-6 overflow-y-auto flex-1 prose prose-slate max-w-none prose-a:text-indigo-600">
                                            {selectedEmail.body_html ? (
                                                <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }} />
                                            ) : (
                                                <pre className="whitespace-pre-wrap font-sans text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                                                    {selectedEmail.body_text}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
