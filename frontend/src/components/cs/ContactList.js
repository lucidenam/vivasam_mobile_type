import React from 'react';

const Contact = ({pkCd, codeNm, ptnCd, ptnNm, ptnTel, addr, ptnChargeGuGunNm, areaCd, handleClick}) => {
    let oneTelNum = ptnTel;
    let index = ptnTel.indexOf(" ");
    if(index > 0) {
        oneTelNum = ptnTel.substring(0, ptnTel.indexOf(" "));
    }

    return (
        <tr>
            <td className="table_list_td" onClick={handleClick(ptnCd)}>
                <p className="location_center">{ptnNm}</p>
                <p className="location_txt">{ptnChargeGuGunNm}</p>
                <p className="location_num mt5">{ptnTel}</p>
            </td>
            <td className="table_list_td">
                <a href={"tel:" + oneTelNum} className="ico_tel ico_tel_static"></a> {/* <!-- [D] 전화번호 a링크에 동일하게 추가 --> */}
            </td>
        </tr>
    );
}


const ContactList = ({contacts, isLoading, handleClick}) => {
    const contactList = contacts.map(contact => {
        return (<Contact {...contact} handleClick={handleClick} key={contact.ptnCd}/>);
    });

    return (
        <table>
            <caption>
                주변지사의 지사명/담당지역/전화번호 전화걸기 정보제공
            </caption>
            <colgroup>
                <col style={{width:'70%'}} />
                <col />
            </colgroup>
            <thead>
                <tr>
                    <th scope="col" className="table_list_th"><span className="table_list_title">지사명/담당지역/전화번호</span></th>
                    <th scope="col" className="table_list_th"><span className="table_list_title">전화걸기</span></th>
                </tr>
            </thead>
            <tbody>
                {isLoading != true && contacts.length == 0 && (
                    <tr>
                        <td className="table_list_td" colSpan='2'>
                            <p style={{textAlign:'center'}}>조회된 자료가 없습니다.</p>
                        </td>
                    </tr>
                )}
                {contactList}
            </tbody>
        </table>
    );
};

export default ContactList;
