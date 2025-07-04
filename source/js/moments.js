document.addEventListener('DOMContentLoaded', () => {
    // --- 配置区域 ---
    const config = {
        baseApiUrl: 'https://anisaga.life/api/v1/accounts/114789272989580253/statuses',
        initialLimit: 5,
        loadMoreLimit: 10,
        excludeReplies: true, // 请不要改这里，还没写好评论部分
        excludeReblogs: false, // 是否允许显示转发内容
    };

    // --- DOM 元素获取 ---
    const timelineContainer = document.getElementById('mastodon-timeline');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadingIndicator = document.querySelector('.timeline-loading');
    const noMorePostsPlaceholder = document.getElementById('no-more-posts-placeholder');

    // --- 状态管理 ---
    let state = {
        nextPageUrl: null,
        isLoading: false,
    };

    /**
     * 解析API响应头中的Link字段，提取下一页的URL
     * @param {string} linkHeader - 响应头中的 Link 字段值
     * @returns {string|null} - 下一页的URL或null
     */
    const parseLinkHeader = (linkHeader) => {
        if (!linkHeader) return null;
        const nextLink = linkHeader.split(',').find(s => s.includes('rel="next"'));
        if (nextLink) {
            const match = nextLink.match(/<([^>]+)>/);
            return match ? match[1] : null;
        }
        return null;
    };

    /**
     * 格式化日期
     * @param {string} dateString - ISO 格式的日期字符串
     * @returns {string} - 格式化后的日期
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        // 如果是同一天，只显示时间
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('zh-CN', {
                hour: '2-digit', 
                minute: '2-digit'
            });
        }
        // 其他情况显示完整日期
        else {
            return date.toLocaleDateString('zh-CN', {
                year: '2-digit',
                month: '2-digit', 
                day: '2-digit'
            }) + ' ' + date.toLocaleTimeString('zh-CN', {
                hour: '2-digit', 
                minute: '2-digit'
            });
        }
    };

    /**
     * 创建单条动态的 HTML 结构
     * @param {object} status - 单条动态的数据对象
     * @returns {HTMLElement} - 构建好的 HTML 元素
     */
    const createStatusElement = (status) => {
        const post = document.createElement('div');
        post.className = 'mastodon-post';
        
        // 判断是否为转发内容
        const isReblog = status.reblog !== null;
        const actualStatus = isReblog ? status.reblog : status;
        
        // 存储原始URL（如果是转发，使用转发的URL）
        post.dataset.url = actualStatus.url;

        let mediaHtml = '';
        if (actualStatus.media_attachments && actualStatus.media_attachments.length > 0) {
            mediaHtml = '<div class="media-attachments">';
            const totalImages = actualStatus.media_attachments.filter(att => att.type === 'image').length;
            
            actualStatus.media_attachments.forEach((attachment, index) => {
                if (attachment.type === 'image' && index < 9) { // 只显示前9张图片
                    // 为超过9张图片的情况添加数量提示
                    const isLastVisible = index === 8 && totalImages > 9;
                    const extraCount = totalImages - 9;
                    
                    mediaHtml += `
                        <a href="${attachment.url}" target="_blank" rel="noopener noreferrer" class="media-link">
                            <img src="${attachment.preview_url}" 
                                 alt="${attachment.description || '动态图片'}" 
                                 loading="lazy"
                                 ${isLastVisible ? `data-count="${extraCount}"` : ''}
                                 onload="this.classList.add('loaded')"
                                 onerror="this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'image-placeholder\\'></div>')">
                        </a>
                    `;
                }
            });
            mediaHtml += '</div>';
        }

        // 构建HTML内容
        let contentHtml = '';
        
        // 如果是转发，添加转发提示
        if (isReblog) {
            contentHtml += `
                <div class="reblog-header">
                    <span class="reblog-icon">🔄</span>
                    <span class="reblog-text">转发了 @${actualStatus.account.username} 的动态</span>
                </div>
            `;
        }
        
        // 主要内容
        contentHtml += `
            <div class="post-content">
                <span class="post-date">${formatDate(actualStatus.created_at)}</span>
                ${actualStatus.content || '<em>（无文字内容）</em>'}
            </div>
            ${mediaHtml}
        `;
        
        post.innerHTML = contentHtml;
        
        // 添加转发样式类
        if (isReblog) {
            post.classList.add('reblog-post');
        }
        
        // 添加图片点击预览功能
        post.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                showImagePreview(e.target.src, actualStatus.media_attachments);
            }
        });
        
        return post;
    };

    /**
     * 从指定的URL获取动态数据并渲染到页面
     * @param {string} url - 要获取数据的API URL
     */
    const fetchAndRenderStatuses = async (url) => {
        if (state.isLoading) return;
        state.isLoading = true;
        loadMoreBtn.textContent = '加载中...';

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`网络请求失败: ${response.statusText}`);
            
            const statuses = await response.json();
            state.nextPageUrl = parseLinkHeader(response.headers.get('Link'));

            if (statuses.length > 0) {
                statuses.forEach(status => {
                    const statusElement = createStatusElement(status);
                    timelineContainer.appendChild(statusElement);
                });
            }

            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }

            if (state.nextPageUrl) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
                noMorePostsPlaceholder.innerHTML = '<p class="no-more-posts">已经没有更多动态了</p>';
            }
        } catch (error) {
            console.error('获取 Mastodon 动态失败:', error);
            timelineContainer.innerHTML = '<p>动态加载失败，请检查网络或刷新页面。</p>';
        } finally {
            state.isLoading = false;
            loadMoreBtn.textContent = '加载更多';
        }
    };

    /**
     * 处理“加载更多”按钮的点击事件
     */
    const handleLoadMore = () => {
        if (state.nextPageUrl) {
            fetchAndRenderStatuses(state.nextPageUrl);
        }
    };

    /**
     * 【新增】处理时间线容器的点击事件（事件委托）
     * @param {Event} event - 点击事件对象
     */
    const handleTimelineClick = (event) => {
        const clickedPost = event.target.closest('.mastodon-post');

        // 如果没有点击在动态上，或者点击的是动态内部的链接/图片等，则不处理
        if (!clickedPost || event.target.closest('a, img, button')) {
            return;
        }

        // 获取存储在data属性中的URL并在新标签页打开
        const postUrl = clickedPost.dataset.url;
        if (postUrl) {
            window.open(postUrl, '_blank', 'noopener,noreferrer');
        }
    };

    /**
     * 显示图片预览模态框
     * @param {string} imageSrc - 当前图片的URL
     * @param {Array} mediaAttachments - 所有媒体附件
     */
    const showImagePreview = (imageSrc, mediaAttachments) => {
        const images = mediaAttachments.filter(att => att.type === 'image');
        const currentIndex = images.findIndex(img => img.preview_url === imageSrc);
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'image-preview-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="closeImagePreview()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="closeImagePreview()">&times;</button>
                ${images.length > 1 ? `
                    <button class="modal-nav modal-prev" onclick="navigateImage(-1)">&#8249;</button>
                    <button class="modal-nav modal-next" onclick="navigateImage(1)">&#8250;</button>
                ` : ''}
                <img class="modal-image" src="${images[currentIndex].url}" alt="预览图片">
                ${images.length > 1 ? `
                    <div class="modal-counter">${currentIndex + 1} / ${images.length}</div>
                ` : ''}
            </div>
        `;
        
        // 存储当前状态
        modal.dataset.currentIndex = currentIndex;
        modal.dataset.images = JSON.stringify(images.map(img => img.url));
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // 键盘事件监听
        document.addEventListener('keydown', handlePreviewKeydown);
    };

    /**
     * 关闭图片预览
     */
    window.closeImagePreview = () => {
        const modal = document.querySelector('.image-preview-modal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handlePreviewKeydown);
        }
    };

    /**
     * 导航到上一张或下一张图片
     */
    window.navigateImage = (direction) => {
        const modal = document.querySelector('.image-preview-modal');
        if (!modal) return;
        
        const currentIndex = parseInt(modal.dataset.currentIndex);
        const images = JSON.parse(modal.dataset.images);
        const newIndex = (currentIndex + direction + images.length) % images.length;
        
        const modalImage = modal.querySelector('.modal-image');
        const modalCounter = modal.querySelector('.modal-counter');
        
        modalImage.src = images[newIndex];
        modal.dataset.currentIndex = newIndex;
        
        if (modalCounter) {
            modalCounter.textContent = `${newIndex + 1} / ${images.length}`;
        }
    };

    /**
     * 处理预览模态框的键盘事件
     */
    const handlePreviewKeydown = (e) => {
        switch(e.key) {
            case 'Escape':
                closeImagePreview();
                break;
            case 'ArrowLeft':
                navigateImage(-1);
                break;
            case 'ArrowRight':
                navigateImage(1);
                break;
        }
    };

    /**
     * 初始化函数
     */
    const init = () => {
        const initialUrl = new URL(config.baseApiUrl);
        initialUrl.searchParams.append('limit', config.initialLimit);
        if (config.excludeReplies) initialUrl.searchParams.append('exclude_replies', 'true');
        if (config.excludeReblogs) initialUrl.searchParams.append('exclude_reblogs', 'true');
        
        fetchAndRenderStatuses(initialUrl.toString());

        loadMoreBtn.addEventListener('click', handleLoadMore);
        // 【新增】使用事件委托来处理所有动态的点击
        timelineContainer.addEventListener('click', handleTimelineClick);
    };

    init();
});
