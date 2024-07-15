import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export function useScroll(containerRef, loadMoreCallback) {
    const isScrolledToBottom = ref(true)
    const showScrollButton = ref(false)
    const isLoadingMore = ref(false)

    const checkScroll = () => {
        if (containerRef.value) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.value
            const scrollPercentage = (scrollHeight - scrollTop - clientHeight) / scrollHeight
            isScrolledToBottom.value = scrollPercentage < 0.01 // Within 1% of the bottom
            showScrollButton.value = scrollPercentage > 0.2 // Show button when scrolled up more than 20%
        }
    }

    const scrollToBottom = (smooth = false) => {
        nextTick(() => {
            if (containerRef.value) {
                containerRef.value.scrollTop = containerRef.value.scrollHeight
                showScrollButton.value = false
            }
        })
    }

    const handleScroll = async () => {
        checkScroll()
        if (containerRef.value && containerRef.value.scrollTop === 0 && !isLoadingMore.value) {
            isLoadingMore.value = true
            try {
                await loadMoreCallback()
            } catch (error) {
                console.error('Failed to load more messages:', error)
            } finally {
                isLoadingMore.value = false
            }
        }
    }

    onMounted(() => {
        if (containerRef.value) {
            containerRef.value.addEventListener('scroll', handleScroll)
        }
    })

    onUnmounted(() => {
        if (containerRef.value) {
            containerRef.value.removeEventListener('scroll', handleScroll)
        }
    })

    return {
        isScrolledToBottom,
        showScrollButton,
        isLoadingMore,
        scrollToBottom,
        handleScroll,
        checkScroll
    }
}