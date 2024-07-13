import { formatDate } from '../utils/dateFormatter'

export const parseMessage = (key, value) => {
    let parsedValue = value || {}
    let user = 'Unknown'
    let content = ''

    try {
        if (typeof parsedValue.value === 'string') {
            const innerValue = JSON.parse(parsedValue.value)
            if (innerValue && typeof innerValue === 'object') {
                user = innerValue.user || 'Unknown'
                content = innerValue.content || ''
            } else {
                content = parsedValue.value
            }
        } else {
            content = parsedValue.value || ''
        }
    } catch (e) {
        console.error('Error parsing message:', e)
        content = parsedValue.value || ''
    }

    return {
        key,
        user,
        content,
        timestamp: formatDate(parsedValue.key || key),
        hash: parsedValue.hash || ''
    }
}

export const createMessageData = (user, content) => {
    return {
        user: user || 'Anonymous',
        content: content,
        timestamp: new Date().toISOString()
    }
}