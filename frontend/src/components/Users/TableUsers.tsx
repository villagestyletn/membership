import React, { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import BaseButton from '../BaseButton'
import CardBoxModal from '../CardBoxModal'
import CardBox from "../CardBox";
import { fetch, update, deleteItem, setRefetch, deleteItemsByIds } from '../../stores/users/usersSlice'
import { useAppDispatch, useAppSelector } from '../../stores/hooks'
import { useRouter } from 'next/router'
import { Field, Form, Formik } from "formik";
import {
    DataGrid,
    GridColDef,
} from '@mui/x-data-grid';
import {loadColumns} from "./configureUsersCols";
import _ from 'lodash';
import dataFormatter from '../../helpers/dataFormatter'
import {dataGridStyles} from "../../styles";
import axios from 'axios';

const perPage = 10;

const TableSampleUsers = ({ filterItems, setFilterItems, filters, showGrid }) => {
  const notify = (type, msg) => toast( msg, {type, position: "bottom-center"});

    const dispatch = useAppDispatch();
    const router = useRouter();

    const pagesList = [];
    const [id, setId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [filterRequest, setFilterRequest] = React.useState('');
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortModel, setSortModel] = useState([
        {
            field: '',
            sort: 'desc',
        },
    ]);
  const { users, loading, count, notify: usersNotify, refetch } = useAppSelector((state) => state.users)
  const { currentUser } = useAppSelector((state) => state.auth);
  const focusRing = useAppSelector((state) => state.style.focusRingColor);
  const bgColor = useAppSelector((state) => state.style.bgLayoutColor);
  const corners = useAppSelector((state) => state.style.corners);
    const numPages = Math.floor(count / perPage) === 0 ? 1 : Math.ceil(count / perPage);
    for (let i = 0; i < numPages; i++) {
        pagesList.push(i);
    }

    const loadData = async (page = currentPage, request = filterRequest) => {
        if (page !== currentPage) setCurrentPage(page);
        if (request !== filterRequest) setFilterRequest(request);
        const { sort, field } = sortModel[0];

      const query = `?page=${page}&limit=${perPage}${request}&sort=${sort}&field=${field}`;
      dispatch(fetch({ limit: perPage, page, query }));
  };

  useEffect(() => {
      if (usersNotify.showNotification) {
          notify(usersNotify.typeNotification, usersNotify.textNotification);
      }
  }, [usersNotify.showNotification]);

  useEffect(() => {
      if (!currentUser) return;
      loadData();
  }, [sortModel, currentUser]);

  useEffect(() => {
    if (refetch) {
      loadData(0);
      dispatch(setRefetch(false));
    }
  }, [refetch, dispatch]);

  const [isModalInfoActive, setIsModalInfoActive] = useState(false)
  const [isModalTrashActive, setIsModalTrashActive] = useState(false)

  const handleModalAction = () => {
    setIsModalInfoActive(false)
    setIsModalTrashActive(false)
  }

  const handleDeleteModalAction = (id: string) => {
    setId(id)
    setIsModalTrashActive(true)
  }
  const handleDeleteAction = async () => {
      if (id) {
          await dispatch(deleteItem(id));
          await loadData(0);
          setIsModalTrashActive(false);
      }
  };

  const generateFilterRequests = useMemo(() => {
    let request = '&';
    filterItems.forEach((item) => {
      const isRangeFilter = filters.find(
        (filter) =>
          filter.title === item.fields.selectedField &&
          (filter.number || filter.date),
      );

      if (isRangeFilter) {
        const from = item.fields.filterValueFrom;
        const to = item.fields.filterValueTo;
        if (from) {
          request += `${item.fields.selectedField}Range=${from}&`;
        }
        if (to) {
          request += `${item.fields.selectedField}Range=${to}&`;
        }
      } else {
        const value = item.fields.filterValue;
        if (value) {
          request += `${item.fields.selectedField}=${value}&`;
        }
      }
    });
    return request;
  }, [filterItems, filters]);

  const deleteFilter = (value) => {
    const newItems = filterItems.filter((item) => item.id !== value);

    if (newItems.length) {
        setFilterItems(newItems);
    } else {
        loadData(0, '');
        setFilterItems(newItems);
    }
  };

  const handleSubmit = () => {
    loadData(0, generateFilterRequests);
  };

  const handleChange = (id) => (e) => {
    const value = e.target.value;
    const name = e.target.name;

    setFilterItems(
      filterItems.map((item) => {
        if (item.id !== id) return item;
        if (name === 'selectedField') return { id, fields: { [name]: value } };

        return { id, fields: { ...item.fields, [name]: value } }
      }),
    );
  };

  const handleReset = () => {
      setFilterItems([]);
      loadData(0, '');
  };

  const onPageChange = (page: number) => {
    loadData(page);
    setCurrentPage(page);
  };

  useEffect(() => {
    loadColumns(handleDeleteModalAction, `users`).then((newCols) =>
      setColumns(newCols),
    );
  }, []);

  const handleTableSubmit = async (id: string, data) => {
    delete data?.password;
    if (!_.isEmpty(data)) {
      await dispatch(update({ id, data }))
        .unwrap()
        .then((res) => res)
        .catch((err) => {
          throw new Error(err);
        });
    }
  };

  const onDeleteRows = async (selectedRows) => {
    await dispatch(deleteItemsByIds(selectedRows));
    await loadData(0);
  };

  const controlClasses =
      'w-full py-2 px-2 my-2 border-gray-700 rounded dark:placeholder-gray-400 ' +
      ` ${bgColor} ${focusRing} ${corners} ` +
      'dark:bg-slate-800 border';

  const dataGrid = (
        <div id="usersTable" className='relative overflow-x-auto'>
          <DataGrid
              autoHeight
              rowHeight={64}
              sx={dataGridStyles}
              className={'datagrid--table'}
              getRowClassName={() => `datagrid--row`}
              rows={users ?? []}
              columns={columns}
              initialState={{
                  pagination: {
                      paginationModel: {
                          pageSize: 10,
                      },
                  },
              }}
              disableRowSelectionOnClick
              onProcessRowUpdateError={(params) => {
                  console.log('Error', params);
              }}
              processRowUpdate={async (newRow, oldRow) => {
                const data = dataFormatter.dataGridEditFormatter(newRow);

                try {
                  await handleTableSubmit(newRow.id, data);
                  return newRow;
                } catch {
                  return oldRow;
                }
              }}
              sortingMode={'server'}
              checkboxSelection
              onRowSelectionModelChange={(ids) => {
                setSelectedRows(ids)
              }}
              onSortModelChange={(params) => {
                  params.length
                      ? setSortModel(params)
                      : setSortModel([{ field: '', sort: 'desc' }]);
              }}
              rowCount={count}
              pageSizeOptions={[10]}
              paginationMode={'server'}
              loading={loading}
              onPaginationModelChange={(params) => {
                  onPageChange(params.page);
              }}
          />
        </div>
  )

  return (
    <>
    {filterItems && Array.isArray( filterItems ) && filterItems.length ?
        <CardBox>
            <Formik
                initialValues={{
                    checkboxes: ['lorem'],
                    switches: ['lorem'],
                    radio: 'lorem',
                }}
                onSubmit={() => null}
            >
                <Form>
                    <>
                        {filterItems && filterItems.map((filterItem) => {
                            return (
                                <div key={filterItem.id} className="flex mb-4">
                                    <div className="flex flex-col w-full mr-3">
                                        <div className="text-gray-500 font-bold">Filter</div>
                                        <Field
                                            className={controlClasses}
                                            name='selectedField'
                                            id='selectedField'
                                            component='select'
                                            value={filterItem?.fields?.selectedField || ''}
                                            onChange={handleChange(filterItem.id)}
                                        >
                                            {filters.map((selectOption) => (
                                                <option
                                                    key={selectOption.title}
                                                    value={`${selectOption.title}`}
                                                >
                                                    {selectOption.label}
                                                </option>
                                            ))}
                                        </Field>
                                    </div>
                                    {filters.find((filter) => 
                                        filter.title === filterItem?.fields?.selectedField
                                    )?.type === 'enum' ? (
                                        <div className="flex flex-col w-full mr-3">
                                            <div className="text-gray-500 font-bold">
                                                Value
                                            </div>
                                            <Field
                                                className={controlClasses}
                                                name="filterValue"
                                                id='filterValue'
                                                component="select"
                                                value={filterItem?.fields?.filterValue || ''}
                                                onChange={handleChange(filterItem.id)}
                                            >
                                                <option value="">Select Value</option>
                                                {filters.find((filter) => 
                                                    filter.title === filterItem?.fields?.selectedField
                                                )?.options?.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </Field>
                                        </div>
                                    ) : filters.find((filter) => 
                                        filter.title === filterItem?.fields?.selectedField
                                    )?.number ? (
                                        <div className="flex flex-row w-full mr-3">
                                            <div className="flex flex-col w-full mr-3">
                                                <div className="text-gray-500 font-bold">From</div>
                                                <Field
                                                    className={controlClasses}
                                                    name='filterValueFrom'
                                                    placeholder='From'
                                                    id='filterValueFrom'
                                                    value={filterItem?.fields?.filterValueFrom || ''}
                                                    onChange={handleChange(filterItem.id)}
                                                />
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <div className="text-gray-500 font-bold">To</div>
                                                <Field
                                                    className={controlClasses}
                                                    name='filterValueTo'
                                                    placeholder='to'
                                                    id='filterValueTo'
                                                    value={filterItem?.fields?.filterValueTo || ''}
                                                    onChange={handleChange(filterItem.id)}
                                                />
                                            </div>
                                        </div>
                                    ) : filters.find(
                                        (filter) =>
                                            filter.title ===
                                            filterItem?.fields?.selectedField
                                    )?.date ? (
                                        <div className='flex flex-row w-full mr-3'>
                                            <div className='flex flex-col w-full mr-3'>
                                                <div className='text-gray-500 font-bold'>
                                                    From
                                                </div>
                                                <Field
                                                    className={controlClasses}
                                                    name='filterValueFrom'
                                                    placeholder='From'
                                                    id='filterValueFrom'
                                                    type='datetime-local'
                                                    value={filterItem?.fields?.filterValueFrom || ''}
                                                    onChange={handleChange(filterItem.id)}
                                                />
                                            </div>
                                            <div className='flex flex-col w-full'>
                                                <div className='text-gray-500 font-bold'>To</div>
                                                <Field
                                                    className={controlClasses}
                                                    name='filterValueTo'
                                                    placeholder='to'
                                                    id='filterValueTo'
                                                    type='datetime-local'
                                                    value={filterItem?.fields?.filterValueTo || ''}
                                                    onChange={handleChange(filterItem.id)}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col w-full mr-3">
                                            <div className="text-gray-500 font-bold">Contains</div>
                                            <Field
                                                className={controlClasses}
                                                name='filterValue'
                                                placeholder='Contained'
                                                id='filterValue'
                                                value={filterItem?.fields?.filterValue || ''}
                                                onChange={handleChange(filterItem.id)}
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <div className="text-gray-500 font-bold">Action</div>
                                        <BaseButton
                                            className="my-2"
                                            type='reset'
                                            color='danger'
                                            label='Delete'
                                            onClick={() => {
                                                deleteFilter(filterItem.id)
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                        <div className="flex">
                            <BaseButton
                                className="my-2 mr-3"
                               color="success"
                                label='Apply'
                                onClick={handleSubmit}
                            />
                            <BaseButton
                                className="my-2"
                                 color='info'
                                label='Cancel'
                                onClick={handleReset}
                            />
                        </div>
                    </>
                </Form>
            </Formik>
        </CardBox> : null
    }
      <CardBoxModal
        title="Please confirm"
        buttonColor="info"
        buttonLabel={loading ? 'Deleting...' : 'Confirm'}
        isActive={isModalTrashActive}
        onConfirm={handleDeleteAction}
        onCancel={handleModalAction}
      >
        <p>Are you sure you want to delete this item?</p>
      </CardBoxModal>
      {dataGrid}

      {selectedRows.length > 0 &&
        createPortal(
          <BaseButton
            className='me-4'
            color='danger'
            label={`Delete ${selectedRows.length === 1 ? 'Row' : 'Rows'}`}
            onClick={() => onDeleteRows(selectedRows)}
          />,
          document.getElementById('delete-rows-button'),
      )}
    <ToastContainer />
    </>
  )
}

export default TableSampleUsers
