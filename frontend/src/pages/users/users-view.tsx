import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import {useAppDispatch, useAppSelector} from "../../stores/hooks";
import {useRouter} from "next/router";
import { fetch } from '../../stores/users/usersSlice'
import dataFormatter from '../../helpers/dataFormatter';
import LayoutAuthenticated from "../../layouts/Authenticated";
import {getPageTitle} from "../../config";
import SectionTitleLineWithButton from "../../components/SectionTitleLineWithButton";
import SectionMain from "../../components/SectionMain";
import CardBox from "../../components/CardBox";
import BaseButton from "../../components/BaseButton";
import BaseDivider from "../../components/BaseDivider";
import {mdiChartTimelineVariant} from "@mdi/js";
import {SwitchField} from "../../components/SwitchField";
import FormField from "../../components/FormField";

const UsersView = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { users } = useAppSelector((state) => state.users)

    const { id } = router.query;

    function removeLastCharacter(str) {
      console.log(str,`str`)
      return str.slice(0, -1);
    }

    useEffect(() => {
        dispatch(fetch({ id }));
    }, [dispatch, id]);

    return (
      <>
          <Head>
              <title>{getPageTitle('View users')}</title>
          </Head>
          <SectionMain>
            <SectionTitleLineWithButton icon={mdiChartTimelineVariant} title={removeLastCharacter('View users')} main>
                <BaseButton
                  color='info'
                  label='Edit'
                  href={`/users/users-edit/?id=${id}`}
                />
            </SectionTitleLineWithButton>
            <CardBox>

                <div className={'mb-4'}>
                    <p className={'block font-bold mb-2'}>First Name</p>
                    <p>{users?.firstName}</p>
                </div>

                <div className={'mb-4'}>
                    <p className={'block font-bold mb-2'}>Last Name</p>
                    <p>{users?.lastName}</p>
                </div>

                <div className={'mb-4'}>
                    <p className={'block font-bold mb-2'}>Phone Number</p>
                    <p>{users?.phoneNumber}</p>
                </div>

                <div className={'mb-4'}>
                    <p className={'block font-bold mb-2'}>E-Mail</p>
                    <p>{users?.email}</p>
                </div>

                <FormField label='Disabled'>
                    <SwitchField
                      field={{name: 'disabled', value: users?.disabled}}
                      form={{setFieldValue: () => null}}
                      disabled
                    />
                </FormField>

                <div className={'mb-4'}>
                    <p className={'block font-bold mb-2'}>App Role</p>

                        <p>{users?.app_role?.name ?? 'No data'}</p>

                </div>

                <>
                    <p className={'block font-bold mb-2'}>Memberships User</p>
                    <CardBox
                      className='mb-6 border border-gray-300 rounded overflow-hidden'
                      hasTable
                    >
                        <div className='overflow-x-auto'>
                            <table>
                            <thead>
                            <tr>

                                <th>Name</th>

                                <th>Role</th>

                                <th>Active</th>

                                <th>MembershipStartDate</th>

                                <th>MembershipEndDate</th>

                            </tr>
                            </thead>
                            <tbody>
                            {users.memberships_user && Array.isArray(users.memberships_user) &&
                              users.memberships_user.map((item: any) => (
                                <tr key={item.id} onClick={() => router.push(`/memberships/memberships-view/?id=${item.id}`)}>

                                    <td data-label="name">
                                        { item.name }
                                    </td>

                                    <td data-label="role">
                                        { item.role }
                                    </td>

                                    <td data-label="active">
                                        { dataFormatter.booleanFormatter(item.active) }
                                    </td>

                                    <td data-label="membership_start_date">
                                        { dataFormatter.dateTimeFormatter(item.membership_start_date) }
                                    </td>

                                    <td data-label="membership_end_date">
                                        { dataFormatter.dateTimeFormatter(item.membership_end_date) }
                                    </td>

                                </tr>
                              ))}
                            </tbody>
                        </table>
                        </div>
                        {!users?.memberships_user?.length && <div className={'text-center py-4'}>No data</div>}
                    </CardBox>
                </>

                <BaseDivider />

                <BaseButton
                    color='info'
                    label='Back'
                    onClick={() => router.push('/users/users-list')}
                />
              </CardBox>
          </SectionMain>
      </>
    );
};

UsersView.getLayout = function getLayout(page: ReactElement) {
    return (
      <LayoutAuthenticated>
          {page}
      </LayoutAuthenticated>
    )
}

export default UsersView;
