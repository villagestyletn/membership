import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import {useAppDispatch, useAppSelector} from "../../stores/hooks";
import {useRouter} from "next/router";
import { fetch } from '../../stores/memberships/membershipsSlice'
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

const MembershipsView = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { memberships } = useAppSelector((state) => state.memberships)

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
              <title>{getPageTitle('View memberships')}</title>
          </Head>
          <SectionMain>
            <SectionTitleLineWithButton icon={mdiChartTimelineVariant} title={removeLastCharacter('View memberships')} main>
                <BaseButton
                  color='info'
                  label='Edit'
                  href={`/memberships/memberships-edit/?id=${id}`}
                />
            </SectionTitleLineWithButton>
            <CardBox>

                <div className={'mb-4'}>
                    <p className={'block font-bold mb-2'}>Name</p>
                    <p>{memberships?.name}</p>
                </div>

                <div className={'mb-4'}>
                    <p className={'block font-bold mb-2'}>Role</p>
                    <p>{memberships?.role ?? 'No data'}</p>
                </div>

                <div className={'mb-4'}>
                    <p className={'block font-bold mb-2'}>User</p>

                        <p>{memberships?.user?.firstName ?? 'No data'}</p>

                </div>

                <FormField label='Active'>
                    <SwitchField
                      field={{name: 'active', value: memberships?.active}}
                      form={{setFieldValue: () => null}}
                      disabled
                    />
                </FormField>

                <FormField label='MembershipStartDate'>
                    {memberships.membership_start_date ? <DatePicker
                      dateFormat="yyyy-MM-dd hh:mm"
                      showTimeSelect
                      selected={memberships.membership_start_date ?
                        new Date(
                          dayjs(memberships.membership_start_date).format('YYYY-MM-DD hh:mm'),
                        ) : null
                      }
                      disabled
                    /> : <p>No MembershipStartDate</p>}
                </FormField>

                <FormField label='MembershipEndDate'>
                    {memberships.membership_end_date ? <DatePicker
                      dateFormat="yyyy-MM-dd hh:mm"
                      showTimeSelect
                      selected={memberships.membership_end_date ?
                        new Date(
                          dayjs(memberships.membership_end_date).format('YYYY-MM-DD hh:mm'),
                        ) : null
                      }
                      disabled
                    /> : <p>No MembershipEndDate</p>}
                </FormField>

                <BaseDivider />

                <BaseButton
                    color='info'
                    label='Back'
                    onClick={() => router.push('/memberships/memberships-list')}
                />
              </CardBox>
          </SectionMain>
      </>
    );
};

MembershipsView.getLayout = function getLayout(page: ReactElement) {
    return (
      <LayoutAuthenticated>
          {page}
      </LayoutAuthenticated>
    )
}

export default MembershipsView;
