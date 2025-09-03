// Data Loader Module
export class DataLoader {
    constructor() {
        this.dataPath = 'data/data.json';
    }

    async loadData() {
        // 서버가 실행 중인지 확인 (API 호출 시도)
        try {
            const apiResponse = await fetch('/api/data');
            if (apiResponse.ok) {
                const data = await apiResponse.json();
                console.log('Data loaded from server API:', data);
                this.saveData(data);
                return data;
            }
        } catch (error) {
            console.log('Server API not available, falling back to static file');
        }
        
        // 항상 파일에서 먼저 로드 시도 (VSCode Live Server 환경)
        try {
            const response = await fetch(this.dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            console.log('Data loaded from file:', data);
            
            // 로드한 데이터를 localStorage에 백업
            this.saveData(data);
            return data;
        } catch (error) {
            console.error('Error loading data from file:', error);
            
            // 파일 로드 실패 시 localStorage 확인
            const localData = this.loadLocalData();
            if (localData) {
                console.log('Fallback: Loading data from localStorage');
                return localData;
            }
            
            // 둘 다 실패하면 기본 데이터
            console.log('Using default data');
            const defaultData = this.getDefaultData();
            this.saveData(defaultData);
            return defaultData;
        }
    }

    async saveData(data) {
        // localStorage에 저장 (기본)
        try {
            localStorage.setItem('siteData', JSON.stringify(data));
            
            // File System Access API 지원 확인 (Chrome/Edge)
            if ('showSaveFilePicker' in window) {
                // 파일 직접 저장 옵션 제공
                this.fileSystemAvailable = true;
            }
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    async saveToFile(data) {
        // Chrome/Edge에서 파일 직접 저장
        if (!('showSaveFilePicker' in window)) {
            throw new Error('File System Access API not supported');
        }

        try {
            // 파일 선택 다이얼로그 표시
            const handle = await window.showSaveFilePicker({
                suggestedName: 'data.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }]
            });

            // 파일에 쓰기
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();

            return true;
        } catch (error) {
            console.error('Error saving file:', error);
            return false;
        }
    }

    async openAndSaveFile(data) {
        // 기존 data.json 파일을 직접 열어서 수정
        if (!('showOpenFilePicker' in window)) {
            throw new Error('File System Access API not supported');
        }

        try {
            // 파일 선택 다이얼로그
            const [fileHandle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }],
                multiple: false
            });

            // 파일에 쓰기 권한 요청
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();

            return true;
        } catch (error) {
            console.error('Error saving file:', error);
            return false;
        }
    }

    loadLocalData() {
        try {
            const localData = localStorage.getItem('siteData');
            if (localData) {
                return JSON.parse(localData);
            }
        } catch (error) {
            console.error('Error loading local data:', error);
        }
        return null;
    }

    getDefaultData() {
        return {
            site: {
                title: "김포 오퍼스 한강 스위첸",
                description: "김포 한강신도시 프리미엄 주거공간",
                contact: {
                    phone: "1811-0000",
                    hours: "오전 10시 - 오후 6시"
                }
            },
            hero: {
                title: "김포 오퍼스 한강 스위첸",
                subtitle: "한강이 보이는 프리미엄 라이프",
                description: "김포 한강신도시의 새로운 랜드마크",
                backgroundImage: "assets/images/hero/hero.jpg",
                visible: true
            }
        };
    }
}