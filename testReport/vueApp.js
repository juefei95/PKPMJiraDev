
const App = {
    template : `
        <h2>{{message}}</h2>
    `,
    data(){
        return {
            message : "请添加集成任务",
        }
    },
    mounted(){
        //axios.get("/Options").then((response) => {
        //       this.repoList = response.data;
        //    })
    },
    watch: {
        //ciConfig: {
        //    handler(newVal, oldVal) {
        //        console.log(newVal, oldVal)
        //    //axios.get("/Branches?repo=" + newSelect).then((response) => {
        //    //   this.branchOptions = response.data;
        //    //})
        //    },
        //    deep: true
        //},
    },
    methods:{
    }
}
Vue.createApp(App).mount('#app');
