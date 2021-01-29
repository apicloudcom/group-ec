const UserCenter = {
    isLogin(){
        let access_token = this.getAccessToken();
        return access_token?true:false;
    },
    setUserInfo(userInfo){
        delete userInfo.addtime;
        api.setPrefs({
            key: 'userInfo',
            value: userInfo
        });
        api.setPrefs({
            key: 'access_token',
            value: userInfo.access_token?userInfo.access_token:''
        });
    },
    getUserInfo(){
        let userInfo = api.getPrefs({
            sync: true,
            key: 'userInfo'
        });
        return userInfo?JSON.parse(userInfo):'';
    },
    getAccessToken(){
        return api.getPrefs({
            sync: true,
            key: 'access_token'
        });
    }
};

export default UserCenter;