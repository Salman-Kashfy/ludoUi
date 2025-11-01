import { Fragment, useState, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import PageTitle from "../../components/PageTitle";
import { GalleryHorizontal } from "lucide-react";
import TableForm from "./TableForm";
import { GetTable, SaveTable } from "../../services/table.service";
import {useParams} from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import { useToast } from "../../utils/toast";

function EditTable() {
    const { successToast, errorToast } = useToast();
    const [loader, setLoader] = useState(false);
    const [formLoader, setFormLoader] = useState(false);
    const { uuid } = useParams();
    const [record, setRecord] = useState({});

    useEffect(() => {
        setFormLoader(true);
        GetTable(uuid).then((res) => {
            setRecord(res);
        }).finally(() => {
            setFormLoader(false);
        });
    }, [uuid]);

    const onSubmit = (data) => {
        setLoader(true);
        SaveTable(data).then((res) => {
            if(res.status) {
                successToast('Updated successfully');
            } else {
                errorToast(res.errorMessage || 'Failed to save table');
            }
        }).finally(() => {
            setLoader(false);
        });
    }

    return (
        <Fragment>
            <PageTitle title="Edit Table" titleIcon={<GalleryHorizontal />} />
            <Card>
                <ProgressBar formLoader={formLoader}/>
                <CardContent>
                    <TableForm record={record} formLoader={formLoader} loader={loader} callback={onSubmit}/>
                </CardContent>
            </Card>
        </Fragment>
    )
}

export default EditTable

