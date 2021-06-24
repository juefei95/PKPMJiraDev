/*
根据外界配置修改当前Tab页的标题
 */

export function modifyTitle(projectType, issueType, mode){
    
    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓这些是filter的标题↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    if (projectType === 'JGVIRUS' && issueType === '故事' && mode === 'filter') {
        window.document.title = "结构需求过滤器";
    }else if (projectType === 'JGVIRUS' && issueType === '故障' && mode === 'filter') {
        window.document.title = "结构Bug过滤器";
    }else if (projectType === 'PC' && issueType === '故障' && mode === 'filter') {
        window.document.title = "PC Bug过滤器";
    }else if (projectType === 'PC' && issueType === 'EPIC' && mode === 'filter') {
        window.document.title = "PC Epic过滤器";
    }else if (projectType === 'BIMMEP' && issueType === '故事' && mode === 'filter') {
        window.document.title = "MEP 需求过滤器";
    }else if (projectType === 'BIMMEP' && issueType === '故障' && mode === 'filter') {
        window.document.title = "MEP Bug过滤器";
    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑这些是filter的标题↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

    // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓这些是report的标题↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    }else if (projectType === 'JGVIRUS' && issueType === '故事' && mode === 'report') {
        window.document.title = "结构需求报告";
    }else if (projectType === 'JGVIRUS' && issueType === '故障' && mode === 'report') {
        window.document.title = "结构Bug报告";
    }else if (projectType === 'PC' && issueType === '故障' && mode === 'report') {
        window.document.title = "PC Bug报告";
    }else if (projectType === 'PC' && issueType === 'EPIC' && mode === 'report') {
        window.document.title = "PC EPIC报告";
    }else if (projectType === 'BIMMEP' && issueType === '故事' && mode === 'report') {
        window.document.title = "MEP需求报告";
    }else if (projectType === 'BIMMEP' && issueType === '故障' && mode === 'report') {
        window.document.title = "MEP Bug报告";
    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑这些是report的标题↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    }
}
