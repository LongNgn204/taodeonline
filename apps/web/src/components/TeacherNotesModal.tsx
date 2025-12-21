// Chú thích: TeacherNotesModal - Modal ghi chú mong muốn của giáo viên
// Cho phép GV nhập preferences về độ khó, style, topics focus

import { useState } from 'react';

interface TeacherPreferences {
    notes: string;
    difficultyBias: 'easy' | 'balanced' | 'hard';
    focusTopics: string[];
    questionStyle: 'formal' | 'practical' | 'contextual';
    exportFormat: 'word' | 'latex' | 'pdf';
    includeHints: boolean;
    shuffleQuestions: boolean;
}

interface TeacherNotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (preferences: TeacherPreferences) => void;
    initialPreferences?: Partial<TeacherPreferences>;
    availableTopics?: { id: string; name: string }[];
}

const DEFAULT_PREFERENCES: TeacherPreferences = {
    notes: '',
    difficultyBias: 'balanced',
    focusTopics: [],
    questionStyle: 'formal',
    exportFormat: 'word',
    includeHints: true,
    shuffleQuestions: true,
};

export function TeacherNotesModal({
    isOpen,
    onClose,
    onSave,
    initialPreferences = {},
    availableTopics = [],
}: TeacherNotesModalProps) {
    const [prefs, setPrefs] = useState<TeacherPreferences>({
        ...DEFAULT_PREFERENCES,
        ...initialPreferences,
    });

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(prefs);
        onClose();
    };

    const toggleTopic = (topicId: string) => {
        setPrefs(prev => ({
            ...prev,
            focusTopics: prev.focusTopics.includes(topicId)
                ? prev.focusTopics.filter(t => t !== topicId)
                : [...prev.focusTopics, topicId],
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>📝 Ghi chú mong muốn</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Notes tự do */}
                    <div className="form-group">
                        <label>Ghi chú tự do</label>
                        <textarea
                            value={prefs.notes}
                            onChange={e => setPrefs(p => ({ ...p, notes: e.target.value }))}
                            placeholder="Nhập các yêu cầu đặc biệt của bạn..."
                            rows={4}
                            maxLength={2000}
                        />
                        <span className="char-count">{prefs.notes.length}/2000</span>
                    </div>

                    {/* Độ khó */}
                    <div className="form-group">
                        <label>Độ khó mong muốn</label>
                        <div className="difficulty-slider">
                            {(['easy', 'balanced', 'hard'] as const).map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    className={`difficulty-btn ${prefs.difficultyBias === level ? 'active' : ''}`}
                                    onClick={() => setPrefs(p => ({ ...p, difficultyBias: level }))}
                                >
                                    {level === 'easy' && '😊 Dễ'}
                                    {level === 'balanced' && '⚖️ Cân bằng'}
                                    {level === 'hard' && '🔥 Khó'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Style câu hỏi */}
                    <div className="form-group">
                        <label>Phong cách câu hỏi</label>
                        <div className="style-options">
                            {(['formal', 'practical', 'contextual'] as const).map(style => (
                                <label key={style} className="radio-option">
                                    <input
                                        type="radio"
                                        name="questionStyle"
                                        checked={prefs.questionStyle === style}
                                        onChange={() => setPrefs(p => ({ ...p, questionStyle: style }))}
                                    />
                                    <span className="radio-label">
                                        {style === 'formal' && '📚 Học thuật chuẩn'}
                                        {style === 'practical' && '🔧 Ứng dụng thực tế'}
                                        {style === 'contextual' && '📖 Có ngữ cảnh/tình huống'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Focus topics */}
                    {availableTopics.length > 0 && (
                        <div className="form-group">
                            <label>Chủ đề ưu tiên</label>
                            <div className="topics-grid">
                                {availableTopics.map(topic => (
                                    <button
                                        key={topic.id}
                                        type="button"
                                        className={`topic-chip ${prefs.focusTopics.includes(topic.id) ? 'selected' : ''}`}
                                        onClick={() => toggleTopic(topic.id)}
                                    >
                                        {topic.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Export format */}
                    <div className="form-group">
                        <label>Định dạng xuất</label>
                        <div className="export-options">
                            {(['word', 'latex', 'pdf'] as const).map(format => (
                                <button
                                    key={format}
                                    type="button"
                                    className={`export-btn ${prefs.exportFormat === format ? 'active' : ''}`}
                                    onClick={() => setPrefs(p => ({ ...p, exportFormat: format }))}
                                >
                                    {format === 'word' && '📄 Word'}
                                    {format === 'latex' && '📐 LaTeX'}
                                    {format === 'pdf' && '📕 PDF'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="form-group toggles">
                        <label className="toggle-option">
                            <input
                                type="checkbox"
                                checked={prefs.includeHints}
                                onChange={e => setPrefs(p => ({ ...p, includeHints: e.target.checked }))}
                            />
                            <span>Thêm gợi ý trong đáp án</span>
                        </label>
                        <label className="toggle-option">
                            <input
                                type="checkbox"
                                checked={prefs.shuffleQuestions}
                                onChange={e => setPrefs(p => ({ ...p, shuffleQuestions: e.target.checked }))}
                            />
                            <span>Xáo trộn câu hỏi khi tạo mã đề khác</span>
                        </label>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Hủy</button>
                    <button className="btn-primary" onClick={handleSave}>
                        Lưu mong muốn
                    </button>
                </div>

                <style>{`
                    .modal-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        animation: fadeIn 0.2s ease;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .modal-content {
                        background: white;
                        border-radius: 16px;
                        width: 100%;
                        max-width: 560px;
                        max-height: 90vh;
                        overflow-y: auto;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                        animation: slideUp 0.3s ease;
                    }
                    @keyframes slideUp {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1.25rem 1.5rem;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .modal-header h2 {
                        margin: 0;
                        font-size: 1.25rem;
                        color: #1f2937;
                    }
                    .modal-close {
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #9ca3af;
                        transition: color 0.2s;
                    }
                    .modal-close:hover { color: #4b5563; }
                    .modal-body {
                        padding: 1.5rem;
                    }
                    .form-group {
                        margin-bottom: 1.25rem;
                    }
                    .form-group label {
                        display: block;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                        color: #374151;
                    }
                    .form-group textarea {
                        width: 100%;
                        padding: 0.75rem;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        resize: vertical;
                        font-family: inherit;
                        transition: border-color 0.2s;
                    }
                    .form-group textarea:focus {
                        outline: none;
                        border-color: #6366f1;
                    }
                    .char-count {
                        display: block;
                        text-align: right;
                        font-size: 0.75rem;
                        color: #9ca3af;
                        margin-top: 0.25rem;
                    }
                    .difficulty-slider {
                        display: flex;
                        gap: 0.5rem;
                    }
                    .difficulty-btn, .export-btn {
                        flex: 1;
                        padding: 0.75rem;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        background: white;
                        cursor: pointer;
                        font-size: 0.9rem;
                        transition: all 0.2s;
                    }
                    .difficulty-btn:hover, .export-btn:hover {
                        border-color: #6366f1;
                    }
                    .difficulty-btn.active, .export-btn.active {
                        background: #eef2ff;
                        border-color: #6366f1;
                        color: #4f46e5;
                        font-weight: 600;
                    }
                    .style-options {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    .radio-option {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .radio-option:hover { background: #f3f4f6; }
                    .radio-option input { cursor: pointer; }
                    .topics-grid {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }
                    .topic-chip {
                        padding: 0.5rem 0.75rem;
                        border: 1px solid #e5e7eb;
                        border-radius: 20px;
                        background: white;
                        cursor: pointer;
                        font-size: 0.85rem;
                        transition: all 0.2s;
                    }
                    .topic-chip:hover {
                        border-color: #6366f1;
                    }
                    .topic-chip.selected {
                        background: #6366f1;
                        border-color: #6366f1;
                        color: white;
                    }
                    .export-options {
                        display: flex;
                        gap: 0.5rem;
                    }
                    .toggles {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    .toggle-option {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                    }
                    .toggle-option input {
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                    }
                    .modal-footer {
                        display: flex;
                        justify-content: flex-end;
                        gap: 0.75rem;
                        padding: 1rem 1.5rem;
                        border-top: 1px solid #e5e7eb;
                    }
                    .btn-secondary, .btn-primary {
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .btn-secondary {
                        background: white;
                        border: 2px solid #e5e7eb;
                        color: #4b5563;
                    }
                    .btn-secondary:hover {
                        background: #f3f4f6;
                    }
                    .btn-primary {
                        background: #6366f1;
                        border: none;
                        color: white;
                    }
                    .btn-primary:hover {
                        background: #4f46e5;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default TeacherNotesModal;
