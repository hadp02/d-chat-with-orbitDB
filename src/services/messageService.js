import { formatDate } from '../utils/dateFormatter'

class MessageService {
    parseMessage(key, value) {
        let parsedValue = value || {};
        let user = 'Unknown';
        let content = '';

        try {
            if (typeof parsedValue.value === 'string') {
                const innerValue = JSON.parse(parsedValue.value);
                if (innerValue && typeof innerValue === 'object') {
                    user = innerValue.user || 'Unknown';
                    content = innerValue.content || '';
                } else {
                    content = parsedValue.value;
                }
            } else {
                content = parsedValue.value || '';
            }
        } catch (e) {
            console.error('Error parsing message:', e);
            content = parsedValue.value || '';
        }

        return {
            key,
            user,
            content,
            timestamp: formatDate(parsedValue.key || key),
            hash: parsedValue.hash || '',
            id: key, // Thêm trường id để hỗ trợ chỉnh sửa tin nhắn
            editHistory: [] // Thêm trường editHistory để lưu lịch sử chỉnh sửa
        };
    }

    createMessageData(user, content) {
        const timestamp = new Date().toISOString();
        return {
            user: user || 'Anonymous',
            content: content,
            timestamp: timestamp,
            id: timestamp, // Sử dụng timestamp làm id
            editHistory: []
        };
    }
}

export default new MessageService();