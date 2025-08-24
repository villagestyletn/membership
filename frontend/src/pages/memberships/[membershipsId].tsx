import { mdiChartTimelineVariant, mdiUpload } from '@mdi/js'
import Head from 'next/head'
import React, { ReactElement, useEffect, useState } from 'react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";

import CardBox from '../../components/CardBox'
import LayoutAuthenticated from '../../layouts/Authenticated'
import SectionMain from '../../components/SectionMain'
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton'
import { getPageTitle } from '../../config'

import { Field, Form, Formik } from 'formik'
import FormField from '../../components/FormField'
import BaseDivider from '../../components/BaseDivider'
import BaseButtons from '../../components/BaseButtons'
import BaseButton from '../../components/BaseButton'
import FormCheckRadio from '../../components/FormCheckRadio'
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup'
import { SelectField } from "../../components/SelectField";
import { SelectFieldMany } from "../../components/SelectFieldMany";
import { SwitchField } from '../../components/SwitchField'
import {RichTextField} from "../../components/RichTextField";

import { update, fetch } from '../../stores/memberships/membershipsSlice'
import { useAppDispatch, useAppSelector } from '../../stores/hooks'
import { useRouter } from 'next/router'

const EditMemberships = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const initVals = {

    'name': '',

    role: '',

    user: null,

    active: false,

    membership_start_date: new Date(),

    membership_end_date: new Date(),

  }
  const [initialValues, setInitialValues] = useState(initVals)

  const { memberships } = useAppSelector((state) => state.memberships)

  const { membershipsId } = router.query

  useEffect(() => {
    dispatch(fetch({ id: membershipsId }))
  }, [membershipsId])

  useEffect(() => {
    if (typeof memberships === 'object') {
      setInitialValues(memberships)
    }
  }, [memberships])

  useEffect(() => {
      if (typeof memberships === 'object') {

          const newInitialVal = {...initVals};

          Object.keys(initVals).forEach(el => newInitialVal[el] = (memberships)[el])

          setInitialValues(newInitialVal);
      }
  }, [memberships])

  const handleSubmit = async (data) => {
    await dispatch(update({ id: membershipsId, data }))
    await router.push('/memberships/memberships-list')
  }

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit memberships')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiChartTimelineVariant} title={'Edit memberships'} main>
        {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>

    <FormField
        label="Name"
    >
        <Field
            name="name"
            placeholder="Name"
        />
    </FormField>

    <FormField label="Role" labelFor="role">
        <Field name="role" id="role" component="select">

            <option value="President">President</option>

            <option value="VicePresident">VicePresident</option>

            <option value="Secretary">Secretary</option>

            <option value="JointSecretary">JointSecretary</option>

            <option value="Treasurer">Treasurer</option>

            <option value="GeneralBodyMember">GeneralBodyMember</option>

            <option value="NormalMember">NormalMember</option>

            <option value="PatronMember">PatronMember</option>

            <option value="AdministrativeMember">AdministrativeMember</option>

            <option value="GeneralMember">GeneralMember</option>

        </Field>
    </FormField>

    <FormField label='User' labelFor='user'>
        <Field
            name='user'
            id='user'
            component={SelectField}
            options={initialValues.user}
            itemRef={'users'}

            showField={'firstName'}

        ></Field>
    </FormField>

    <FormField label='Active' labelFor='active'>
        <Field
            name='active'
            id='active'
            component={SwitchField}
        ></Field>
    </FormField>

      <FormField
          label="MembershipStartDate"
      >
          <DatePicker
              dateFormat="yyyy-MM-dd hh:mm"
              showTimeSelect
              selected={initialValues.membership_start_date ?
                  new Date(
                      dayjs(initialValues.membership_start_date).format('YYYY-MM-DD hh:mm'),
                  ) : null
              }
              onChange={(date) => setInitialValues({...initialValues, 'membership_start_date': date})}
          />
      </FormField>

      <FormField
          label="MembershipEndDate"
      >
          <DatePicker
              dateFormat="yyyy-MM-dd hh:mm"
              showTimeSelect
              selected={initialValues.membership_end_date ?
                  new Date(
                      dayjs(initialValues.membership_end_date).format('YYYY-MM-DD hh:mm'),
                  ) : null
              }
              onChange={(date) => setInitialValues({...initialValues, 'membership_end_date': date})}
          />
      </FormField>

              <BaseDivider />
              <BaseButtons>
                <BaseButton type="submit" color="info" label="Submit" />
                <BaseButton type="reset" color="info" outline label="Reset" />
                <BaseButton type='reset' color='danger' outline label='Cancel' onClick={() => router.push('/memberships/memberships-list')}/>
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  )
}

EditMemberships.getLayout = function getLayout(page: ReactElement) {
  return (
      <LayoutAuthenticated>
          {page}
      </LayoutAuthenticated>
  )
}

export default EditMemberships
