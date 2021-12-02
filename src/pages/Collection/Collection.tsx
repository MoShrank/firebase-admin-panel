import "./style.scss";
import config from "../../config.json";
import { getDocuments, publishChanges } from "../../api";
import { useState, useEffect, useMemo } from "react";
import { useTable, usePagination } from "react-table";
import { useParams } from "react-router-dom";

import { getAuth } from "firebase/auth";

interface EditableCellI {
  value: string;
  row: {
    index: number;
  };
  column: {
    id: string;
  };
  updateMyData: (index: number, id: string, value: string) => void;
}

// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}: EditableCellI) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return <input value={value} onChange={onChange} onBlur={onBlur} />;
};

const defaultColumn = {
  Cell: EditableCell,
};

interface TableI {
  columns: any;
  data: any;
  updateMyData: (index: number, id: string, value: string) => void;
  skipPageReset: boolean;
}

// Be sure to pass our updateMyData and the skipPageReset option
function Table({ columns, data, updateMyData, skipPageReset }: TableI) {
  // For this example, we're using pagination to illustrate how to stop
  // the current page from resetting when our data changes
  // Otherwise, nothing is different here.

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    //@ts-ignore
    page,
    //@ts-ignore
    canPreviousPage,
    //@ts-ignore
    canNextPage,
    //@ts-ignore
    pageOptions,
    //@ts-ignore
    pageCount,
    //@ts-ignore
    gotoPage,
    //@ts-ignore
    nextPage,
    //@ts-ignore
    previousPage,
    //@ts-ignore
    setPageSize,
    //@ts-ignore
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      // use the skipPageReset option to disable page resetting temporarily
      //@ts-ignore
      autoResetPage: !skipPageReset,
      // updateMyData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateMyData,
    },
    usePagination
  );

  // Render the UI for your table
  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row: any, i: number) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: any) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

const Collection = () => {
  const { id } = useParams();
  const [documents, setDocuments]: Array<any> = useState([]);
  const [originalDocuments, setOriginalDocuments] = useState(documents);
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [publishEnabled, setPublishEnabled] = useState(true);

  const columns = useMemo(() => {
    return config.collections[0].fields.map((field) => {
      return {
        Header: field.name,
        accessor: field.name,
      };
    });
  }, []);

  useEffect(() => {
    const auth = getAuth();
    console.log(auth);

    const getCollections = async () => {
      if (id) {
        const collections = await getDocuments(id);
        setDocuments(collections);
        setOriginalDocuments(collections);
      }
    };

    getCollections();
  }, []);

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex: number, columnId: string, value: string) => {
    // We also turn on the flag to not reset the page
    setSkipPageReset(true);
    setDocuments((old: any) =>
      old.map((row: any, index: number) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  const handlePublishChanges = async () => {
    if (id && documents.length) {
      setPublishEnabled(false);
      await publishChanges(id, documents);
      setPublishEnabled(true);
    }
  };

  // After data chagnes, we turn the flag back off
  // so that if data actually changes when we're not
  // editing it, the page is reset
  useEffect(() => {
    setSkipPageReset(false);
  }, [documents]);

  // Let's add a data resetter/randomizer to help
  // illustrate that flow...
  const resetData = () => setDocuments(originalDocuments);

  return (
    <>
      <button onClick={resetData}>Reset Data</button>
      <Table
        columns={columns}
        data={documents}
        updateMyData={updateMyData}
        skipPageReset={skipPageReset}
      />
      <button onClick={handlePublishChanges} disabled={!publishEnabled}>
        Publish Changes
      </button>
    </>
  );
};

export default Collection;
