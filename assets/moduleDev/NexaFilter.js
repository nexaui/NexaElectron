class NexaFilter {
    /**
     * Parse filter string into array of filters with arguments
     */
    parseFilters(filterString) {
        const filters = [];
        const parts = filterString.split('|');
        
        for (const part of parts) {
            const filter = part.trim();
            if (!filter) continue;
            
            // Parse filter name and arguments
            if (filter.includes(':')) {
                const [name, argsStr] = filter.split(':', 2);
                const args = argsStr.split(',');
                filters.push({ name, args });
            } else {
                filters.push({ name: filter, args: [] });
            }
        }
        return filters;
    }

    /**
     * Apply filter to value
     */
    applyFilter(value, filterName, args = []) {
        switch (filterName.toLowerCase()) {
            case 'upper':
                return String(value).toUpperCase();
            case 'lower':
                return String(value).toLowerCase();
            case 'truncate':
                const length = args[0] ? parseInt(args[0]) : 100;
                return String(value).length > length ? 
                    String(value).substr(0, length) + '...' : value;
            case 'date':
                const format = args[0] || 'YYYY-MM-DD';
                return this.formatDate(new Date(value), format);
            case 'time_ago':
                return this.timeAgo(new Date(value).getTime());
            case 'number_format':
                const decimals = args[0] ? parseInt(args[0]) : 0;
                return new Intl.NumberFormat('id-ID', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }).format(value);
            case 'currency':
                const currency = args[0] || 'IDR';
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: currency
                }).format(value);
            case 'capitalize':
                return String(value).charAt(0).toUpperCase() + String(value).slice(1);
            case 'slug':
                return this.createSlug(String(value));
            case 'nl2br':
                return String(value).replace(/\n/g, '<br>');
            case 'strip_tags':
                return String(value).replace(/<[^>]*>/g, '');
            case 'round':
                const precision = args[0] ? parseInt(args[0]) : 0;
                return Number(value).toFixed(precision);
            case 'percent':
                const percentDecimals = args[0] ? parseInt(args[0]) : 0;
                return `${Number(value).toFixed(percentDecimals)}%`;
            case 'filesize':
                return this.formatFileSize(Number(value));
            case 'json_encode':
                return JSON.stringify(value);
            case 'json_decode':
                return JSON.parse(value);
            case 'escape':
                return String(value)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            case 'url_encode':
                return encodeURIComponent(String(value));
            case 'base64_encode':
                return btoa(String(value));
            case 'md5':
                return this.md5(String(value));
            case 'phone':
                return this.formatPhoneNumber(String(value));
            case 'mask':
                const maskChar = args[0] || '*';
                const start = args[1] ? parseInt(args[1]) : 4;
                const end = args[2] ? parseInt(args[2]) : 4;
                return this.maskString(String(value), maskChar, start, end);
            case 'trim':
                return String(value).trim();
            case 'replace':
                const search = args[0] || '';
                const replace = args[1] || '';
                return String(value).replace(new RegExp(search, 'g'), replace);
            case 'decimal_to_rupiah':
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(value);
            case 'join':
                const separator = args[0] || ', ';
                return Array.isArray(value) ? value.join(separator) : String(value);
            case 'split':
                const delimiter = args[0] || ',';
                return String(value).split(delimiter);
            case 'indonesian_date':
                return this.formatIndonesianDate(new Date(value));
            case 'age':
                return this.calculateAge(new Date(value));
            case 'relative_time':
                return this.getRelativeTime(new Date(value).getTime());
            default:
                return value;
        }
    }

    /**
     * Helper methods
     */
    createSlug(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return `${bytes.toFixed(2)} ${units[i]}`;
    }

    formatPhoneNumber(number) {
        number = number.replace(/\D/g, '');
        if (number.startsWith('62') || number.startsWith('0')) {
            number = number.replace(/^62|^0/, '+62 ');
            return number.replace(/(\d{4})/g, '$1 ').trim();
        }
        return number;
    }

    maskString(string, mask = '*', start = 4, end = 4) {
        const length = string.length;
        if (length <= start + end) return string;
        
        const visibleStart = string.slice(0, start);
        const visibleEnd = string.slice(-end);
        const masked = mask.repeat(length - start - end);
        
        return visibleStart + masked + visibleEnd;
    }

    timeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const months = Math.floor(diff / 2592000000);
        const years = Math.floor(diff / 31536000000);

        if (diff < 60000) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }

    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    formatIndonesianDate(date) {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    getRelativeTime(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const months = Math.floor(diff / 2592000000);
        const years = Math.floor(diff / 31536000000);

        if (diff < 60000) return 'baru saja';
        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        if (days < 30) return `${days} hari yang lalu`;
        if (months < 12) return `${months} bulan yang lalu`;
        return `${years} tahun yang lalu`;
    }

    formatDate(date, format) {
        const pad = (num) => String(num).padStart(2, '0');
        
        const formats = {
            YYYY: date.getFullYear(),
            MM: pad(date.getMonth() + 1),
            DD: pad(date.getDate()),
            HH: pad(date.getHours()),
            mm: pad(date.getMinutes()),
            ss: pad(date.getSeconds())
        };

        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => formats[match]);
    }

    // Simple MD5 implementation (for demo purposes - in production use a proper crypto library)
    md5(string) {
        return string; // Placeholder - use proper MD5 implementation in production
    }
}

export default NexaFilter; 