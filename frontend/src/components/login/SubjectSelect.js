import React from 'react';

const SubjectSelect = ({name,value,subjects,handleChange,schoolGrade}) => {
    if(!subjects) return null;
    //과목 리스트
    const subjectOption = subjects.filter(function(item) {
        if(item.codeId === 'SC300' || item.codeId === 'SC400' || item.codeId === 'SC500') return false;
        if (schoolGrade === 'H' && item.codeName === '도덕') item.codeName = '윤리';
        if (schoolGrade !== 'H' && item.codeName === '교양') return false;
        if (schoolGrade !== 'H' && item.codeName === '윤리') item.codeName = '도덕';
        return true
    })
    .map(subject => {
        return <option
            key={subject.codeId}
            value={subject.codeId}>
            {subject.codeName}
        </option>;
    });

    return (
        <select value={value} name={name} onChange={handleChange}>
            <option value="" >교과를 선택하세요</option>
            {subjectOption}
        </select>
    );
};

export default SubjectSelect;
