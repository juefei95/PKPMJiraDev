/*
根据外界配置修改当前Tab页的标题
 */

export function modifyTitle(projectType, issueType, mode){
    
    let proj = projectType;
    if (projectType === 'JGVIRUS'){
        proj = "结构";
    }

    let type = "";
    if (issueType === '故事' || issueType === 'EPIC') {
        type = "需求"
    }else if (issueType === '故障'){
        type = "Bug"
    }

    let view = "";
    if (mode === 'filter') {
        view = "过滤器"
    }else if(mode === 'report'){
        view = "报告"
    }
    
    window.document.title = proj + type + view;
}
